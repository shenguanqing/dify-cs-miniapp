import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { DifyClient, extractRetrieverResources } from './dify.client';
import {
  ChatDto,
  FeedbackDto,
  HandoffDto,
  NewConversationDto,
} from './dto/chat.dto';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly dify: DifyClient,
  ) {}

  /**
   * 发送问题。
   * - stream=false（默认）：阻塞模式，返回完整答案，最省心。
   * - stream=true：SSE 流式，小程序需在 wx.request 开启 enableChunked。
   * POST /api/ai/chat
   *
   * 单独限流：AI 调用最消耗资源（Dify + 大模型），比全局更严格。
   * 默认 60 秒内最多 10 次提问，防止刷接口、控制成本。
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('chat')
  async chat(
    @CurrentUser('id') userId: string,
    @Body() dto: ChatDto,
    @Res() res: Response,
  ) {
    if (!dto.stream) {
      const data = await this.aiService.chatBlocking(userId, dto);
      return res.json({ code: 0, message: 'ok', data });
    }
    return this.chatStream(userId, dto, res);
  }

  /** SSE 流式转发：把 Dify 的 SSE 逐块透传给小程序，并在结束时落库。 */
  private async chatStream(userId: string, dto: ChatDto, res: Response) {
    const conv = await this.aiService.prepareStream(userId, dto);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const started = Date.now();
    let answer = '';
    let difyConversationId = conv.difyConversationId ?? '';
    let difyMessageId = '';
    let retrieverResources: any[] = [];

    const collectSources = (evt: any) => {
      const resources = extractRetrieverResources(evt);
      if (resources.length) retrieverResources = resources;
    };

    try {
      const stream = await this.dify.chatStream({
        query: dto.question,
        user: userId,
        conversationId: conv.difyConversationId,
      });

      // 使用 Buffer 暂存原始字节，避免中文多字节字符在 chunk 边界被切断导致乱码
      let lineBuffer = Buffer.alloc(0);
      stream.on('data', (chunk: Buffer) => {
        lineBuffer = Buffer.concat([lineBuffer, chunk]);
        // 按换行符拆分，最后一段可能不完整，保留到下次
        const newlineIdx = lineBuffer.lastIndexOf(0x0a); // \n
        if (newlineIdx < 0) return;
        const completePart = lineBuffer.subarray(0, newlineIdx + 1);
        lineBuffer = lineBuffer.subarray(newlineIdx + 1);
        const text = completePart.toString('utf-8');
        const lines = text.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const evt = JSON.parse(jsonStr);
            if (evt.conversation_id) difyConversationId = evt.conversation_id;
            if (evt.message_id) difyMessageId = evt.message_id;
            collectSources(evt);
            if (evt.event === 'message' && evt.answer) {
              answer += evt.answer;
              // 转发为更简洁的事件给前端
              res.write(`data: ${JSON.stringify({ type: 'chunk', text: evt.answer })}\n\n`);
            } else if (evt.event === 'message_end') {
              res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
            } else if (evt.event === 'error') {
              res.write(`data: ${JSON.stringify({ type: 'error', message: evt.message })}\n\n`);
            }
          } catch {
            /* 跳过无法解析的行 */
          }
        }
      });

      stream.on('end', async () => {
        // 处理 buffer 中剩余的最后一段
        if (lineBuffer.length > 0) {
          const remaining = lineBuffer.toString('utf-8').trim();
          if (remaining.startsWith('data:')) {
            const jsonStr = remaining.slice(5).trim();
            if (jsonStr && jsonStr !== '[DONE]') {
              try {
                const evt = JSON.parse(jsonStr);
                if (evt.conversation_id) difyConversationId = evt.conversation_id;
                if (evt.message_id) difyMessageId = evt.message_id;
                collectSources(evt);
                if (evt.event === 'message' && evt.answer) {
                  answer += evt.answer;
                }
              } catch { /* 跳过 */ }
            }
          }
        }

        const localMessageId = await this.aiService.saveStreamResult(
          userId,
          conv,
          dto.question,
          answer,
          difyConversationId,
          difyMessageId,
          retrieverResources,
          Date.now() - started,
        );
        res.write(
          `data: ${JSON.stringify({
            type: 'done',
            conversationId: conv.id,
            messageId: localMessageId,
            difyMessageId,
            sources: this.aiService.formatSources(retrieverResources),
          })}\n\n`,
        );
        res.end();
      });

      stream.on('error', (err: Error) => {
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: '智能客服繁忙，请稍后再试或转人工' })}\n\n`,
        );
        res.end();
      });
    } catch (e: any) {
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: '智能客服暂时不可用，请转人工' })}\n\n`,
      );
      res.end();
    }
  }

  /** 新建会话 POST /api/ai/conversation/new */
  @Post('conversation/new')
  @HttpCode(200)
  newConversation(
    @CurrentUser('id') userId: string,
    @Body() dto: NewConversationDto,
  ) {
    return this.aiService.newConversation(userId, dto.scene);
  }

  /** 历史消息 GET /api/ai/history?conversationId=xxx */
  @Get('history')
  history(
    @CurrentUser('id') userId: string,
    @Query('conversationId') conversationId: string,
  ) {
    return this.aiService.history(userId, conversationId);
  }

  /** 用户反馈 POST /api/ai/feedback */
  @Post('feedback')
  @HttpCode(200)
  feedback(@CurrentUser('id') userId: string, @Body() dto: FeedbackDto) {
    return this.aiService.feedback(userId, dto);
  }

  /** 转人工 POST /api/ai/handoff */
  @Post('handoff')
  @HttpCode(200)
  handoff(@CurrentUser('id') userId: string, @Body() dto: HandoffDto) {
    return this.aiService.handoff(userId, dto);
  }

  /** 前端配置 GET /api/ai/config */
  @Get('config')
  config() {
    return {
      welcome: '您好，我是智能客服助手，请问有什么可以帮您？',
      placeholder: '请输入您的问题',
      enableHandoff: true,
      enableFeedback: true,
      scenes: [
        { key: 'default', label: '通用咨询' },
        { key: 'after_sales', label: '售后服务' },
        { key: 'pre_sales', label: '售前咨询' },
      ],
    };
  }
}

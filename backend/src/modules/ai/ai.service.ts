import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationEntity,
  MessageEntity,
} from '../../database/entities';
import { DifyClient } from './dify.client';
import { SensitiveService } from './sensitive.service';
import { ChatDto, FeedbackDto, HandoffDto } from './dto/chat.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger('AiService');

  constructor(
    private readonly dify: DifyClient,
    private readonly sensitive: SensitiveService,
    @InjectRepository(ConversationEntity)
    private readonly convRepo: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly msgRepo: Repository<MessageEntity>,
  ) {}

  /** 新建会话（仅本地记录，Dify 会话 ID 在首条消息后回填）。 */
  async newConversation(userId: string, scene = 'default') {
    const conv = await this.convRepo.save(
      this.convRepo.create({ userId, scene }),
    );
    return { conversationId: conv.id, scene: conv.scene };
  }

  /** 拉取或校验本地会话，返回 Dify conversationId。 */
  private async resolveConversation(userId: string, conversationId?: string, scene = 'default') {
    if (conversationId) {
      const conv = await this.convRepo.findOne({
        where: { id: conversationId, userId },
      });
      if (!conv) throw new BadRequestException('会话不存在');
      return conv;
    }
    return this.convRepo.save(this.convRepo.create({ userId, scene }));
  }

  formatSources(resources: any[] = []) {
    return (resources || []).map((r: any) => ({
      documentName:
        r.document_name ??
        r.documentName ??
        r.title ??
        r.metadata?.document_name ??
        r.metadata?.documentName,
      content: r.content,
      score: r.score ?? r.metadata?.score,
      datasetName: r.dataset_name ?? r.metadata?.dataset_name,
      segmentId: r.segment_id ?? r.metadata?.segment_id,
    }));
  }

  /** 阻塞模式问答：转发 Dify -> 落库 -> 返回。 */
  async chatBlocking(userId: string, dto: ChatDto) {
    if (this.sensitive.hasSensitive(dto.question)) {
      throw new BadRequestException('您的提问包含不被允许的内容');
    }

    const conv = await this.resolveConversation(userId, dto.conversationId, dto.scene);
    const started = Date.now();

    try {
      const result = await this.dify.chatBlocking({
        query: dto.question,
        user: userId,
        conversationId: conv.difyConversationId,
      });

      // 回填 Dify 会话 ID
      if (!conv.difyConversationId && result.conversationId) {
        conv.difyConversationId = result.conversationId;
        await this.convRepo.save(conv);
      }

      const latencyMs = Date.now() - started;
      const msg = await this.msgRepo.save(
        this.msgRepo.create({
          userId,
          conversationId: conv.id,
          difyMessageId: result.messageId,
          question: dto.question,
          answer: result.answer,
          retrieverResources: result.retrieverResources,
          latencyMs,
          totalTokens: result.totalTokens,
          status: 'success',
        }),
      );

      return {
        conversationId: conv.id,
        messageId: msg.id,
        difyMessageId: result.messageId,
        answer: result.answer,
        // 引用来源（精简）：文档名 + 片段内容
        sources: this.formatSources(result.retrieverResources),
        latencyMs,
      };
    } catch (e: any) {
      const latencyMs = Date.now() - started;
      await this.msgRepo.save(
        this.msgRepo.create({
          userId,
          conversationId: conv.id,
          question: dto.question,
          status: 'error',
          errorMessage: e?.message ?? 'dify error',
          latencyMs,
        }),
      );
      this.logger.error(`Dify 调用失败: ${e?.message}`);
      // fallback：提示转人工
      throw new ServiceUnavailableException(
        '智能客服暂时繁忙，您可以稍后再试或点击「转人工」',
      );
    }
  }

  /** 校验会话并返回（供流式接口在写入响应前准备）。 */
  async prepareStream(userId: string, dto: ChatDto) {
    if (this.sensitive.hasSensitive(dto.question)) {
      throw new BadRequestException('您的提问包含不被允许的内容');
    }
    const conv = await this.resolveConversation(userId, dto.conversationId, dto.scene);
    return conv;
  }

  /** 流式结束后落库。 */
  async saveStreamResult(
    userId: string,
    conv: ConversationEntity,
    question: string,
    answer: string,
    difyConversationId: string,
    difyMessageId: string,
    retrieverResources: any[],
    latencyMs: number,
  ) {
    if (!conv.difyConversationId && difyConversationId) {
      conv.difyConversationId = difyConversationId;
      await this.convRepo.save(conv);
    }
    const msg = await this.msgRepo.save(
      this.msgRepo.create({
        userId,
        conversationId: conv.id,
        difyMessageId,
        question,
        answer,
        retrieverResources,
        latencyMs,
        status: 'success',
      }),
    );
    return msg.id;
  }

  /** 历史消息。 */
  async history(userId: string, conversationId: string) {
    const list = await this.msgRepo.find({
      where: { userId, conversationId },
      order: { createdAt: 'ASC' },
    });
    return list.map((m) => ({
      id: m.id,
      question: m.question,
      answer: m.answer,
      sources: this.formatSources(m.retrieverResources || []),
      feedback: m.feedback,
      createdAt: m.createdAt,
    }));
  }

  /** 用户反馈：本地落库 + 透传 Dify。 */
  async feedback(userId: string, dto: FeedbackDto) {
    const msg = await this.msgRepo.findOne({
      where: { id: dto.messageId, userId },
    });
    if (!msg) throw new BadRequestException('消息不存在');

    msg.feedback = dto.rating >= 1 ? 1 : -1;
    await this.msgRepo.save(msg);

    if (msg.difyMessageId) {
      try {
        await this.dify.feedback(
          msg.difyMessageId,
          msg.feedback === 1 ? 'like' : 'dislike',
          userId,
        );
      } catch (e: any) {
        this.logger.warn(`Dify 反馈透传失败: ${e?.message}`);
      }
    }
    return { ok: true };
  }

  /** 转人工：标记会话，实际工单/客服系统对接由业务方扩展。 */
  async handoff(userId: string, dto: HandoffDto) {
    const conv = await this.convRepo.findOne({
      where: { id: dto.conversationId, userId },
    });
    if (!conv) throw new BadRequestException('会话不存在');
    conv.handoff = true;
    await this.convRepo.save(conv);
    this.logger.log(`用户 ${userId} 会话 ${conv.id} 申请转人工: ${dto.reason ?? ''}`);
    return { ok: true, message: '已为您转接人工客服，请稍候' };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface DifyChatParams {
  query: string;
  user: string; // 终端用户唯一标识，传 userId
  conversationId?: string;
  inputs?: Record<string, any>;
}

export interface DifyBlockingResult {
  answer: string;
  conversationId: string;
  messageId: string;
  retrieverResources: any[];
  totalTokens: number;
}

export function extractRetrieverResources(payload: any): any[] {
  const candidates = [
    payload?.metadata?.retriever_resources,
    payload?.retriever_resources,
    payload?.result,
    payload?.data?.result,
    payload?.data?.outputs?.result,
    payload?.workflow_run?.outputs?.result,
    payload?.data?.workflow_run?.outputs?.result,
  ];

  const found = candidates.find((item) => Array.isArray(item));
  return found ?? [];
}

/**
 * 封装 Dify 应用 API（POST /v1/chat-messages）。
 * Dify Key、内网地址都只保存在后端，不暴露给小程序。
 */
@Injectable()
export class DifyClient {
  private readonly logger = new Logger('DifyClient');
  private readonly http: AxiosInstance;

  constructor(private readonly cfg: ConfigService) {
    this.http = axios.create({
      baseURL: this.cfg.get<string>('DIFY_API_BASE_URL', 'http://localhost/v1'),
      timeout: this.cfg.get<number>('DIFY_TIMEOUT', 60000),
      headers: {
        Authorization: `Bearer ${this.cfg.get<string>('DIFY_API_KEY', '')}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /** 阻塞模式：一次性拿到完整回答，适合小程序 wx.request。 */
  async chatBlocking(params: DifyChatParams): Promise<DifyBlockingResult> {
    try {
      const { data } = await this.http.post('/chat-messages', {
        inputs: params.inputs ?? {},
        query: params.query,
        response_mode: 'blocking',
        conversation_id: params.conversationId ?? '',
        user: params.user,
      });

      return {
        answer: data?.answer ?? '',
        conversationId: data?.conversation_id ?? params.conversationId ?? '',
        messageId: data?.message_id ?? '',
        retrieverResources: extractRetrieverResources(data),
        totalTokens: data?.metadata?.usage?.total_tokens ?? 0,
      };
    } catch (e: any) {
      const status = e.response?.status;
      const body = e.response?.data;
      this.logger.error(
        `Dify chat-messages 失败: status=${status} body=${JSON.stringify(body)} message=${e.message}`,
      );
      throw e;
    }
  }

  /**
   * 流式模式：返回 Node 可读流（Dify 的 SSE），由 controller 转发给前端。
   * responseType=stream 让 axios 直接把底层流交出来。
   */
  async chatStream(params: DifyChatParams) {
    const response = await this.http.post(
      '/chat-messages',
      {
        inputs: params.inputs ?? {},
        query: params.query,
        response_mode: 'streaming',
        conversation_id: params.conversationId ?? '',
        user: params.user,
      },
      { responseType: 'stream' },
    );
    return response.data; // Node.js Readable stream
  }

  /**
   * 消息反馈（点赞/点踩），对应 Dify /messages/{message_id}/feedbacks
   */
  async feedback(messageId: string, rating: 'like' | 'dislike' | null, user: string) {
    await this.http.post(`/messages/${messageId}/feedbacks`, {
      rating,
      user,
    });
  }
}

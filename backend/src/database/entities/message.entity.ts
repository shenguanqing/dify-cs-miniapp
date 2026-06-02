import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * 问答日志：对应方案第 9 节后端落库字段。
 * 一行 = 一问一答（含引用文档、耗时、token、反馈）。
 */
@Entity('qa_messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 64 })
  userId: string;

  @Index()
  @Column({ length: 64 })
  conversationId: string;

  // Dify 返回的 message_id，反馈时用
  @Index()
  @Column({ length: 64, nullable: true })
  difyMessageId?: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text', nullable: true })
  answer?: string;

  // 引用文档（检索片段来源），存 JSON。
  // 注意：列类型与 PostgreSQL 的 JSONB 对应；若改用 MySQL，请把 'jsonb' 改成 'json'。
  @Column({ type: 'jsonb', nullable: true })
  retrieverResources?: any;

  // 耗时（毫秒）
  @Column({ type: 'int', default: 0 })
  latencyMs: number;

  // token 消耗
  @Column({ type: 'int', default: 0 })
  totalTokens: number;

  // 用户反馈：1=有用 -1=无用 0=未反馈
  @Column({ type: 'int', default: 0 })
  feedback: number;

  // 状态：success / error
  @Column({ length: 16, default: 'success' })
  status: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;
}

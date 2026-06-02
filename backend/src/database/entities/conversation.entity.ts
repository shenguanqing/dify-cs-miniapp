import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 一个会话 = 小程序里的一段连续对话。
 * difyConversationId 由 Dify 在首条消息后返回，之后续聊带上即可保持上下文。
 */
@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 64 })
  userId: string;

  // Dify 侧会话 ID，首条消息前为空
  @Index()
  @Column({ length: 64, nullable: true })
  difyConversationId?: string;

  // 业务场景，如 after_sales / pre_sales
  @Column({ length: 32, default: 'default' })
  scene: string;

  @Column({ length: 128, nullable: true })
  title?: string;

  // 是否已转人工
  @Column({ default: false })
  handoff: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

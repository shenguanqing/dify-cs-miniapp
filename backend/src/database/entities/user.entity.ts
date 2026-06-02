import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 微信 openid，登录后写入
  @Index({ unique: true })
  @Column({ length: 64 })
  openid: string;

  @Column({ length: 64, nullable: true })
  unionid?: string;

  @Column({ length: 64, nullable: true })
  nickname?: string;

  // 额度控制：当日已用次数等可放业务层，这里保留扩展位
  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

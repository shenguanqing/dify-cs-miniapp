import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversationEntity,
  MessageEntity,
} from '../../database/entities';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DifyClient } from './dify.client';
import { SensitiveService } from './sensitive.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConversationEntity, MessageEntity])],
  controllers: [AiController],
  providers: [AiService, DifyClient, SensitiveService],
})
export class AiModule {}

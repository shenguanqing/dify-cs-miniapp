import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty({ message: '问题不能为空' })
  @MaxLength(2000, { message: '问题过长' })
  question: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  // 业务场景，如 after_sales
  @IsOptional()
  @IsString()
  scene?: string;

  // 是否流式（SSE）。小程序需开启 enableChunked 才生效，默认 false 用阻塞模式。
  @IsOptional()
  @IsBoolean()
  stream?: boolean;
}

export class NewConversationDto {
  @IsOptional()
  @IsString()
  scene?: string;
}

export class FeedbackDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;

  // 1=有用 -1=无用
  @IsNotEmpty()
  rating: number;
}

export class HandoffDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

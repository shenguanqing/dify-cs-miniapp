import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { entities } from './database/entities';
import { SnakeNamingStrategy } from './database/snake-naming.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 全局限流：保护 Dify 与本地模型，避免被刷
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => [
        {
          ttl: cfg.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: cfg.get<number>('THROTTLE_LIMIT', 30),
        },
      ],
    }),

    // 数据库（支持 postgres / mysql 切换）
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: cfg.get<string>('DB_TYPE', 'postgres') as 'postgres' | 'mysql',
        host: cfg.get<string>('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get<string>('DB_USERNAME', 'postgres'),
        password: cfg.get<string>('DB_PASSWORD', 'postgres'),
        database: cfg.get<string>('DB_DATABASE', 'ai_customer_service'),
        entities,
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: cfg.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        autoLoadEntities: true,
      }),
    }),

    AuthModule,
    AiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

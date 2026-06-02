import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 简单敏感词过滤，对应方案「敏感词过滤」。
 * 生产环境可替换为 DFA 算法或第三方内容安全服务。
 */
@Injectable()
export class SensitiveService {
  private readonly words: string[];

  constructor(cfg: ConfigService) {
    this.words = (cfg.get<string>('SENSITIVE_WORDS', '') || '')
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);
  }

  hasSensitive(text: string): boolean {
    if (!this.words.length) return false;
    return this.words.some((w) => text.includes(w));
  }
}

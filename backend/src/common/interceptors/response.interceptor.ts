import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应结构：{ code, message, data }
 * 注意：流式 SSE 接口会跳过本拦截器（在 controller 中直接写 response 流）。
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse();
    // SSE / 已接管的响应不包装
    if (res.headersSent || res.getHeader?.('Content-Type')?.toString().includes('text/event-stream')) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'ok',
        data: data ?? null,
      })),
    );
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * 全局异常兜底：把任意异常转成统一结构 { code, message, data }。
 * 对应方案「异常兜底」「fallback，例如 Dify 异常时提示转人工」。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    // 流式响应已经开始，无法再写 JSON，直接结束
    if (res.headersSent) {
      try {
        res.end();
      } catch {
        /* noop */
      }
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = '服务暂时不可用，请稍后再试或转人工客服';
    if (exception instanceof HttpException) {
      const r = exception.getResponse();
      message =
        typeof r === 'string'
          ? r
          : (r as any)?.message
            ? Array.isArray((r as any).message)
              ? (r as any).message.join('; ')
              : (r as any).message
            : message;
    }

    this.logger.error(
      `${req.method} ${req.url} -> ${status} | ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    res.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}

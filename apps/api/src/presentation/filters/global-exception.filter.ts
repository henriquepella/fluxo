import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';
import { DomainException } from '../../shared/exceptions/domain.exception';

interface MappedError {
  status: number;
  code: string;
  message: string;
  details?: string[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, details } = this.mapException(exception);

    if (status >= 500) {
      this.logger.error({ err: exception, path: request.url }, message);
    } else {
      this.logger.warn({ err: exception, path: request.url }, message);
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapException(exception: unknown): MappedError {
    if (exception instanceof DomainException) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const rawMessage =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ?? exception.message);

      if (Array.isArray(rawMessage)) {
        return {
          status,
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: rawMessage,
        };
      }
      return { status, code: HttpStatus[status] ?? 'HTTP_EXCEPTION', message: rawMessage };
    }

    // Never leak internals of unexpected errors to the client.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    };
  }
}

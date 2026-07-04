import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { EnvironmentVariables, NodeEnv } from '../config/env.validation';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => {
        const isProduction = config.get('NODE_ENV', { infer: true }) === NodeEnv.Production;

        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: { singleLine: true, translateTime: 'SYS:HH:MM:ss' },
                },
            genReqId: (req, res): string => {
              const header = req.headers['x-request-id'];
              const requestId = (Array.isArray(header) ? header[0] : header) ?? randomUUID();
              res.setHeader('x-request-id', requestId);
              return requestId;
            },
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie'],
            },
            autoLogging: {
              ignore: (req): boolean => req.url?.startsWith('/api/health') ?? false,
            },
          },
        };
      },
    }),
  ],
})
export class AppLoggerModule {}

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';
import { setupApp } from './app.setup';
import { setupSwagger } from './app.swagger';
import { EnvironmentVariables, NodeEnv } from './infrastructure/config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.enableCors({
    origin: config.get('CORS_ORIGIN', { infer: true }),
    credentials: true,
  });

  setupApp(app);

  if (config.get('NODE_ENV', { infer: true }) !== NodeEnv.Production) {
    setupSwagger(app);
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}

void bootstrap();

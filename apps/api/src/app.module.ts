import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { validateEnv } from './infrastructure/config/env.validation';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { AppLoggerModule } from './infrastructure/logger/logger.module';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';
import { HealthModule } from './presentation/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    AppLoggerModule,
    PrismaModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class AppModule {}

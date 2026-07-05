import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentVariables, validateEnv } from './infrastructure/config/env.validation';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { AppLoggerModule } from './infrastructure/logger/logger.module';
import { AccountsModule } from './presentation/accounts/accounts.module';
import { AuthModule } from './presentation/auth/auth.module';
import { BudgetsModule } from './presentation/budgets/budgets.module';
import { JwtAuthGuard } from './presentation/auth/guards/jwt-auth.guard';
import { CategoriesModule } from './presentation/categories/categories.module';
import { DashboardModule } from './presentation/dashboard/dashboard.module';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';
import { HealthModule } from './presentation/health/health.module';
import { TransactionsModule } from './presentation/transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }) },
      }),
    }),
    AppLoggerModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    AccountsModule,
    BudgetsModule,
    CategoriesModule,
    TransactionsModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // All routes require a JWT unless explicitly marked with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}

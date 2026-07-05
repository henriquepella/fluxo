import { Module } from '@nestjs/common';
import { GetDashboardSummaryUseCase } from '../../application/use-cases/dashboard/get-dashboard-summary.use-case';
import { GetMonthlyHistoryUseCase } from '../../application/use-cases/dashboard/get-monthly-history.use-case';
import { RepositoriesModule } from '../../infrastructure/database/repositories.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [RepositoriesModule],
  controllers: [DashboardController],
  providers: [GetDashboardSummaryUseCase, GetMonthlyHistoryUseCase],
})
export class DashboardModule {}

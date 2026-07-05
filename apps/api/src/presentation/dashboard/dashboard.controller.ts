import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  DashboardSummary,
  GetDashboardSummaryUseCase,
} from '../../application/use-cases/dashboard/get-dashboard-summary.use-case';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { DashboardSummaryQuery } from './dto/dashboard-summary.query';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardSummary: GetDashboardSummaryUseCase) {}

  @Get('summary')
  @ApiOperation({ summary: 'Monthly totals, expense breakdown and recent transactions' })
  summary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DashboardSummaryQuery,
  ): Promise<DashboardSummary> {
    return this.getDashboardSummary.execute(user.id, query.month);
  }
}

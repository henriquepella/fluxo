import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Budget, BudgetWithUsage } from '../../domain/entities/budget.entity';
import { CreateBudgetUseCase } from '../../application/use-cases/budgets/create-budget.use-case';
import { DeleteBudgetUseCase } from '../../application/use-cases/budgets/delete-budget.use-case';
import { ListBudgetsUseCase } from '../../application/use-cases/budgets/list-budgets.use-case';
import { UpdateBudgetUseCase } from '../../application/use-cases/budgets/update-budget.use-case';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { ListBudgetsQuery } from './dto/list-budgets.query';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(
    private readonly listBudgets: ListBudgetsUseCase,
    private readonly createBudget: CreateBudgetUseCase,
    private readonly updateBudget: UpdateBudgetUseCase,
    private readonly deleteBudget: DeleteBudgetUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List budgets with month usage (default: current month)' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListBudgetsQuery,
  ): Promise<BudgetWithUsage[]> {
    return this.listBudgets.execute(user.id, query.month);
  }

  @Post()
  @ApiOperation({ summary: 'Create a monthly budget for an expense category' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBudgetDto): Promise<Budget> {
    return this.createBudget.execute({ userId: user.id, ...dto });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Change a budget limit' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<Budget> {
    return this.updateBudget.execute({ userId: user.id, budgetId: id, ...dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    return this.deleteBudget.execute(user.id, id);
  }
}

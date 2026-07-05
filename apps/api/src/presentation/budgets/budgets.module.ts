import { Module } from '@nestjs/common';
import { CreateBudgetUseCase } from '../../application/use-cases/budgets/create-budget.use-case';
import { DeleteBudgetUseCase } from '../../application/use-cases/budgets/delete-budget.use-case';
import { ListBudgetsUseCase } from '../../application/use-cases/budgets/list-budgets.use-case';
import { UpdateBudgetUseCase } from '../../application/use-cases/budgets/update-budget.use-case';
import { RepositoriesModule } from '../../infrastructure/database/repositories.module';
import { BudgetsController } from './budgets.controller';

@Module({
  imports: [RepositoriesModule],
  controllers: [BudgetsController],
  providers: [ListBudgetsUseCase, CreateBudgetUseCase, UpdateBudgetUseCase, DeleteBudgetUseCase],
})
export class BudgetsModule {}

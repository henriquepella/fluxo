import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  BUDGET_REPOSITORY,
  type BudgetRepository,
} from '../../../domain/repositories/budget.repository';

@Injectable()
export class DeleteBudgetUseCase {
  constructor(@Inject(BUDGET_REPOSITORY) private readonly budgets: BudgetRepository) {}

  async execute(userId: string, budgetId: string): Promise<void> {
    const budget = await this.budgets.findByIdForUser(budgetId, userId);
    if (!budget) {
      throw new ResourceNotFoundException('Budget', budgetId);
    }
    await this.budgets.delete(budget.id);
  }
}

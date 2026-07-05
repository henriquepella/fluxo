import { Inject, Injectable } from '@nestjs/common';
import type { Budget } from '../../../domain/entities/budget.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  BUDGET_REPOSITORY,
  type BudgetRepository,
} from '../../../domain/repositories/budget.repository';

export interface UpdateBudgetInput {
  userId: string;
  budgetId: string;
  amountCents: number;
}

@Injectable()
export class UpdateBudgetUseCase {
  constructor(@Inject(BUDGET_REPOSITORY) private readonly budgets: BudgetRepository) {}

  async execute(input: UpdateBudgetInput): Promise<Budget> {
    const budget = await this.budgets.findByIdForUser(input.budgetId, input.userId);
    if (!budget) {
      throw new ResourceNotFoundException('Budget', input.budgetId);
    }
    return this.budgets.updateAmount(budget.id, input.amountCents);
  }
}

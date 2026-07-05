import { Inject, Injectable } from '@nestjs/common';
import type { BudgetWithUsage } from '../../../domain/entities/budget.entity';
import {
  BUDGET_REPOSITORY,
  type BudgetRepository,
} from '../../../domain/repositories/budget.repository';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepository,
} from '../../../domain/repositories/transaction.repository';
import { resolveMonthRange } from '../../shared/month-range';

@Injectable()
export class ListBudgetsUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgets: BudgetRepository,
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
  ) {}

  /** Budgets with how much of each was spent in the given month (default: current). */
  async execute(userId: string, month?: string): Promise<BudgetWithUsage[]> {
    const { from, to } = resolveMonthRange(month);
    const [budgets, spentByCategory] = await Promise.all([
      this.budgets.findManyByUser(userId),
      this.transactions.expenseByCategory(userId, from, to),
    ]);

    const spentMap = new Map(
      spentByCategory
        .filter((entry) => entry.categoryId !== null)
        .map((entry) => [entry.categoryId as string, entry.totalCents]),
    );

    return budgets
      .map(({ category, ...budget }) => {
        const spentCents = spentMap.get(budget.categoryId) ?? 0;
        return {
          ...budget,
          categoryName: category.name,
          categoryColor: category.color,
          spentCents,
          percent: Math.round((spentCents / budget.amountCents) * 100),
        };
      })
      .sort((a, b) => b.percent - a.percent);
  }
}

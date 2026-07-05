import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  type CategoryTotal,
  type TransactionRepository,
  type TransactionWithRelations,
} from '../../../domain/repositories/transaction.repository';
import { resolveMonthRange } from '../../shared/month-range';

const RECENT_TRANSACTIONS_LIMIT = 8;

export interface DashboardSummary {
  month: string;
  incomeCents: number;
  expenseCents: number;
  /** Month net result (income − expense). */
  netCents: number;
  /** All-time balance across every account. */
  overallBalanceCents: number;
  expenseByCategory: Array<CategoryTotal & { percent: number }>;
  recentTransactions: TransactionWithRelations[];
}

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
  ) {}

  async execute(userId: string, month?: string): Promise<DashboardSummary> {
    const { from, to, label } = resolveMonthRange(month);

    const [monthTotals, allTimeTotals, expenseByCategory, monthTransactions] = await Promise.all([
      this.transactions.totalsByType(userId, from, to),
      this.transactions.totalsByType(userId),
      this.transactions.expenseByCategory(userId, from, to),
      this.transactions.findManyByUser(userId, { from, to }),
    ]);

    const totalExpense = monthTotals.expenseCents;

    return {
      month: label,
      incomeCents: monthTotals.incomeCents,
      expenseCents: totalExpense,
      netCents: monthTotals.incomeCents - totalExpense,
      overallBalanceCents: allTimeTotals.incomeCents - allTimeTotals.expenseCents,
      expenseByCategory: expenseByCategory.map((entry) => ({
        ...entry,
        percent: totalExpense === 0 ? 0 : Math.round((entry.totalCents / totalExpense) * 100),
      })),
      recentTransactions: monthTransactions.slice(0, RECENT_TRANSACTIONS_LIMIT),
    };
  }
}

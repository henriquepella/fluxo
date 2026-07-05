import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepository,
} from '../../../domain/repositories/transaction.repository';
import { resolveMonthRange } from '../../shared/month-range';

export interface MonthlyTotals {
  month: string;
  incomeCents: number;
  expenseCents: number;
}

@Injectable()
export class GetMonthlyHistoryUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
  ) {}

  /** Totals for the last `months` months (oldest first), current month included. */
  async execute(userId: string, months = 6): Promise<MonthlyTotals[]> {
    const now = new Date();

    const ranges = Array.from({ length: months }, (_, index) => {
      const offset = months - 1 - index;
      const anchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
      const label = `${anchor.getUTCFullYear()}-${String(anchor.getUTCMonth() + 1).padStart(2, '0')}`;
      return resolveMonthRange(label);
    });

    return Promise.all(
      ranges.map(async ({ from, to, label }) => {
        const totals = await this.transactions.totalsByType(userId, from, to);
        return { month: label, ...totals };
      }),
    );
  }
}

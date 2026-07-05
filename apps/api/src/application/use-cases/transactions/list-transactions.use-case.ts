import { Inject, Injectable } from '@nestjs/common';
import type { TransactionType } from '../../../domain/entities/transaction.entity';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepository,
  type TransactionWithRelations,
} from '../../../domain/repositories/transaction.repository';
import { resolveMonthRange } from '../../shared/month-range';

export interface ListTransactionsInput {
  userId: string;
  /** `YYYY-MM`; defaults to the current month. */
  month?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
}

@Injectable()
export class ListTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
  ) {}

  execute(input: ListTransactionsInput): Promise<TransactionWithRelations[]> {
    const { from, to } = resolveMonthRange(input.month);
    return this.transactions.findManyByUser(input.userId, {
      from,
      to,
      accountId: input.accountId,
      categoryId: input.categoryId,
      type: input.type,
    });
  }
}

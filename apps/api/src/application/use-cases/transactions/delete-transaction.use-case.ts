import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepository,
} from '../../../domain/repositories/transaction.repository';

@Injectable()
export class DeleteTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
  ) {}

  async execute(userId: string, transactionId: string): Promise<void> {
    const transaction = await this.transactions.findByIdForUser(transactionId, userId);
    if (!transaction) {
      throw new ResourceNotFoundException('Transaction', transactionId);
    }
    await this.transactions.delete(transaction.id);
  }
}

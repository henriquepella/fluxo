import { Inject, Injectable } from '@nestjs/common';
import type { TransactionType } from '../../../domain/entities/transaction.entity';
import { BusinessRuleViolationException } from '../../../domain/exceptions/business-rule-violation.exception';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from '../../../domain/repositories/account.repository';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../../domain/repositories/category.repository';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepository,
  type TransactionWithRelations,
} from '../../../domain/repositories/transaction.repository';

export interface UpdateTransactionInput {
  userId: string;
  transactionId: string;
  accountId?: string;
  /** `null` clears the category; `undefined` keeps the current one. */
  categoryId?: string | null;
  type?: TransactionType;
  description?: string;
  amountCents?: number;
  date?: Date;
}

@Injectable()
export class UpdateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
    @Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository,
  ) {}

  async execute(input: UpdateTransactionInput): Promise<TransactionWithRelations> {
    const existing = await this.transactions.findByIdForUser(input.transactionId, input.userId);
    if (!existing) {
      throw new ResourceNotFoundException('Transaction', input.transactionId);
    }

    if (input.accountId) {
      const account = await this.accounts.findByIdForUser(input.accountId, input.userId);
      if (!account) {
        throw new ResourceNotFoundException('Account', input.accountId);
      }
    }

    const finalType = input.type ?? existing.type;
    const finalCategoryId = input.categoryId === undefined ? existing.categoryId : input.categoryId;

    if (finalCategoryId) {
      const category = await this.categories.findByIdForUser(finalCategoryId, input.userId);
      if (!category) {
        throw new ResourceNotFoundException('Category', finalCategoryId);
      }
      if (category.kind !== finalType) {
        throw new BusinessRuleViolationException(
          `Category "${category.name}" is a ${category.kind} category and cannot be used on a ${finalType} transaction`,
        );
      }
    }

    return this.transactions.update(existing.id, {
      accountId: input.accountId,
      categoryId: finalCategoryId,
      type: input.type,
      description: input.description?.trim(),
      amountCents: input.amountCents,
      date: input.date,
    });
  }
}

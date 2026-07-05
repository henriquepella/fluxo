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

export interface CreateTransactionInput {
  userId: string;
  accountId: string;
  categoryId?: string | null;
  type: TransactionType;
  description: string;
  amountCents: number;
  date: Date;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
    @Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository,
  ) {}

  async execute(input: CreateTransactionInput): Promise<TransactionWithRelations> {
    const account = await this.accounts.findByIdForUser(input.accountId, input.userId);
    if (!account) {
      throw new ResourceNotFoundException('Account', input.accountId);
    }

    const categoryId = input.categoryId ?? null;
    if (categoryId) {
      const category = await this.categories.findByIdForUser(categoryId, input.userId);
      if (!category) {
        throw new ResourceNotFoundException('Category', categoryId);
      }
      if (category.kind !== input.type) {
        throw new BusinessRuleViolationException(
          `Category "${category.name}" is a ${category.kind} category and cannot be used on a ${input.type} transaction`,
        );
      }
    }

    return this.transactions.create({
      userId: input.userId,
      accountId: input.accountId,
      categoryId,
      type: input.type,
      description: input.description.trim(),
      amountCents: input.amountCents,
      date: input.date,
    });
  }
}

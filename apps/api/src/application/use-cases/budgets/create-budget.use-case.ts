import { Inject, Injectable } from '@nestjs/common';
import type { Budget } from '../../../domain/entities/budget.entity';
import { BusinessRuleViolationException } from '../../../domain/exceptions/business-rule-violation.exception';
import { ResourceConflictException } from '../../../domain/exceptions/resource-conflict.exception';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  BUDGET_REPOSITORY,
  type BudgetRepository,
} from '../../../domain/repositories/budget.repository';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../../domain/repositories/category.repository';

export interface CreateBudgetInput {
  userId: string;
  categoryId: string;
  amountCents: number;
}

@Injectable()
export class CreateBudgetUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgets: BudgetRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository,
  ) {}

  async execute(input: CreateBudgetInput): Promise<Budget> {
    const category = await this.categories.findByIdForUser(input.categoryId, input.userId);
    if (!category) {
      throw new ResourceNotFoundException('Category', input.categoryId);
    }
    if (category.kind !== 'expense') {
      throw new BusinessRuleViolationException('Budgets only apply to expense categories');
    }
    if (await this.budgets.findByCategoryForUser(input.categoryId, input.userId)) {
      throw new ResourceConflictException(
        `Category "${category.name}" already has a budget — edit it instead`,
      );
    }

    return this.budgets.create(input);
  }
}

import type { Budget } from '../entities/budget.entity';

export const BUDGET_REPOSITORY = Symbol('BudgetRepository');

export interface CreateBudgetData {
  userId: string;
  categoryId: string;
  amountCents: number;
}

export interface BudgetWithCategory extends Budget {
  category: { id: string; name: string; color: string };
}

export interface BudgetRepository {
  findManyByUser(userId: string): Promise<BudgetWithCategory[]>;
  findByIdForUser(id: string, userId: string): Promise<Budget | null>;
  findByCategoryForUser(categoryId: string, userId: string): Promise<Budget | null>;
  create(data: CreateBudgetData): Promise<Budget>;
  updateAmount(id: string, amountCents: number): Promise<Budget>;
  delete(id: string): Promise<void>;
}

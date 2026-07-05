import type { Transaction, TransactionType } from '../entities/transaction.entity';
import type { CategoryKind } from '../entities/category.entity';

export const TRANSACTION_REPOSITORY = Symbol('TransactionRepository');

export interface TransactionFilters {
  from?: Date;
  /** Exclusive upper bound. */
  to?: Date;
  accountId?: string;
  type?: TransactionType;
}

export interface TransactionWithRelations extends Transaction {
  account: { id: string; name: string };
  category: { id: string; name: string; color: string; kind: CategoryKind } | null;
}

export interface CreateTransactionData {
  userId: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  description: string;
  amountCents: number;
  date: Date;
}

export interface UpdateTransactionData {
  accountId?: string;
  categoryId?: string | null;
  type?: TransactionType;
  description?: string;
  amountCents?: number;
  date?: Date;
}

export interface PeriodTotals {
  incomeCents: number;
  expenseCents: number;
}

export interface CategoryTotal {
  categoryId: string | null;
  name: string;
  color: string;
  totalCents: number;
}

export interface TransactionRepository {
  findManyByUser(userId: string, filters: TransactionFilters): Promise<TransactionWithRelations[]>;
  findByIdForUser(id: string, userId: string): Promise<Transaction | null>;
  create(data: CreateTransactionData): Promise<TransactionWithRelations>;
  update(id: string, data: UpdateTransactionData): Promise<TransactionWithRelations>;
  delete(id: string): Promise<void>;
  /** Income/expense totals within [from, to); omit bounds for all-time totals. */
  totalsByType(userId: string, from?: Date, to?: Date): Promise<PeriodTotals>;
  /** Expense breakdown per category within [from, to), largest first. */
  expenseByCategory(userId: string, from: Date, to: Date): Promise<CategoryTotal[]>;
}

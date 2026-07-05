export const TRANSACTION_TYPES = ['income', 'expense'] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  description: string;
  /** Monetary value in integer cents — never floats. Always positive; `type` carries the sign. */
  amountCents: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

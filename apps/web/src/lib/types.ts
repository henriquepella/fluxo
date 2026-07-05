export type AccountType = 'checking' | 'savings' | 'wallet' | 'credit_card' | 'investment';
export type CategoryKind = 'income' | 'expense';
export type TransactionType = 'income' | 'expense';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balanceCents: number;
}

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amountCents: number;
  date: string;
  accountId: string;
  categoryId: string | null;
  account: { id: string; name: string };
  category: { id: string; name: string; color: string; kind: CategoryKind } | null;
}

export interface DashboardSummary {
  month: string;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
  overallBalanceCents: number;
  expenseByCategory: Array<{
    categoryId: string | null;
    name: string;
    color: string;
    totalCents: number;
    percent: number;
  }>;
  recentTransactions: Transaction[];
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  wallet: 'Carteira',
  credit_card: 'Cartão de crédito',
  investment: 'Investimentos',
};

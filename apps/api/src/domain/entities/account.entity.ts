export const ACCOUNT_TYPES = [
  'checking',
  'savings',
  'wallet',
  'credit_card',
  'investment',
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}

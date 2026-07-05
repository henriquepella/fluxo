import type { Account, AccountType } from '../entities/account.entity';

export const ACCOUNT_REPOSITORY = Symbol('AccountRepository');

export interface CreateAccountData {
  userId: string;
  name: string;
  type: AccountType;
}

export interface UpdateAccountData {
  name?: string;
  type?: AccountType;
}

/** Account enriched with its computed balance (income − expense, in cents). */
export interface AccountWithBalance extends Account {
  balanceCents: number;
}

export interface AccountRepository {
  findManyByUser(userId: string): Promise<AccountWithBalance[]>;
  findByIdForUser(id: string, userId: string): Promise<Account | null>;
  findByNameForUser(name: string, userId: string): Promise<Account | null>;
  create(data: CreateAccountData): Promise<Account>;
  update(id: string, data: UpdateAccountData): Promise<Account>;
  delete(id: string): Promise<void>;
}

import { Inject, Injectable } from '@nestjs/common';
import type { Account, AccountType } from '../../../domain/entities/account.entity';
import { ResourceConflictException } from '../../../domain/exceptions/resource-conflict.exception';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from '../../../domain/repositories/account.repository';

export interface UpdateAccountInput {
  userId: string;
  accountId: string;
  name?: string;
  type?: AccountType;
}

@Injectable()
export class UpdateAccountUseCase {
  constructor(@Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository) {}

  async execute(input: UpdateAccountInput): Promise<Account> {
    const account = await this.accounts.findByIdForUser(input.accountId, input.userId);
    if (!account) {
      throw new ResourceNotFoundException('Account', input.accountId);
    }

    const name = input.name?.trim();
    if (name && name !== account.name) {
      const duplicate = await this.accounts.findByNameForUser(name, input.userId);
      if (duplicate && duplicate.id !== account.id) {
        throw new ResourceConflictException(`An account named "${name}" already exists`);
      }
    }

    return this.accounts.update(account.id, { name, type: input.type });
  }
}

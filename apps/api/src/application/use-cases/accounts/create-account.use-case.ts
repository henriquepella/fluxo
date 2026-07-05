import { Inject, Injectable } from '@nestjs/common';
import type { Account, AccountType } from '../../../domain/entities/account.entity';
import { ResourceConflictException } from '../../../domain/exceptions/resource-conflict.exception';
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from '../../../domain/repositories/account.repository';

export interface CreateAccountInput {
  userId: string;
  name: string;
  type: AccountType;
}

@Injectable()
export class CreateAccountUseCase {
  constructor(@Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    const name = input.name.trim();

    if (await this.accounts.findByNameForUser(name, input.userId)) {
      throw new ResourceConflictException(`An account named "${name}" already exists`);
    }

    return this.accounts.create({ userId: input.userId, name, type: input.type });
  }
}

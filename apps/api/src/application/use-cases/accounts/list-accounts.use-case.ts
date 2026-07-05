import { Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
  type AccountWithBalance,
} from '../../../domain/repositories/account.repository';

@Injectable()
export class ListAccountsUseCase {
  constructor(@Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository) {}

  execute(userId: string): Promise<AccountWithBalance[]> {
    return this.accounts.findManyByUser(userId);
  }
}

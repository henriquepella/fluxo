import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from '../../../domain/repositories/account.repository';

@Injectable()
export class DeleteAccountUseCase {
  constructor(@Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository) {}

  async execute(userId: string, accountId: string): Promise<void> {
    const account = await this.accounts.findByIdForUser(accountId, userId);
    if (!account) {
      throw new ResourceNotFoundException('Account', accountId);
    }
    await this.accounts.delete(account.id);
  }
}

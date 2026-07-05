import { Module } from '@nestjs/common';
import { CreateAccountUseCase } from '../../application/use-cases/accounts/create-account.use-case';
import { DeleteAccountUseCase } from '../../application/use-cases/accounts/delete-account.use-case';
import { ListAccountsUseCase } from '../../application/use-cases/accounts/list-accounts.use-case';
import { UpdateAccountUseCase } from '../../application/use-cases/accounts/update-account.use-case';
import { RepositoriesModule } from '../../infrastructure/database/repositories.module';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [RepositoriesModule],
  controllers: [AccountsController],
  providers: [
    ListAccountsUseCase,
    CreateAccountUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
  ],
})
export class AccountsModule {}

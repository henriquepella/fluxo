import { Module } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/use-cases/transactions/create-transaction.use-case';
import { DeleteTransactionUseCase } from '../../application/use-cases/transactions/delete-transaction.use-case';
import { ListTransactionsUseCase } from '../../application/use-cases/transactions/list-transactions.use-case';
import { UpdateTransactionUseCase } from '../../application/use-cases/transactions/update-transaction.use-case';
import { RepositoriesModule } from '../../infrastructure/database/repositories.module';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [RepositoriesModule],
  controllers: [TransactionsController],
  providers: [
    ListTransactionsUseCase,
    CreateTransactionUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
  ],
})
export class TransactionsModule {}

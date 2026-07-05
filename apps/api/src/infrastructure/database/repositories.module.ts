import { Module } from '@nestjs/common';
import { ACCOUNT_REPOSITORY } from '../../domain/repositories/account.repository';
import { BUDGET_REPOSITORY } from '../../domain/repositories/budget.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';
import { TRANSACTION_REPOSITORY } from '../../domain/repositories/transaction.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { PrismaAccountRepository } from './repositories/prisma-account.repository';
import { PrismaBudgetRepository } from './repositories/prisma-budget.repository';
import { PrismaCategoryRepository } from './repositories/prisma-category.repository';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

/** Binds domain repository ports to their Prisma adapters. */
@Module({
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: ACCOUNT_REPOSITORY, useClass: PrismaAccountRepository },
    { provide: CATEGORY_REPOSITORY, useClass: PrismaCategoryRepository },
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: BUDGET_REPOSITORY, useClass: PrismaBudgetRepository },
  ],
  exports: [
    USER_REPOSITORY,
    ACCOUNT_REPOSITORY,
    CATEGORY_REPOSITORY,
    TRANSACTION_REPOSITORY,
    BUDGET_REPOSITORY,
  ],
})
export class RepositoriesModule {}

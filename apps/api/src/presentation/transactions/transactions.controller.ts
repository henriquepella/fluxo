import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { TransactionWithRelations } from '../../domain/repositories/transaction.repository';
import { CreateTransactionUseCase } from '../../application/use-cases/transactions/create-transaction.use-case';
import { DeleteTransactionUseCase } from '../../application/use-cases/transactions/delete-transaction.use-case';
import { ListTransactionsUseCase } from '../../application/use-cases/transactions/list-transactions.use-case';
import { UpdateTransactionUseCase } from '../../application/use-cases/transactions/update-transaction.use-case';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQuery } from './dto/list-transactions.query';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly listTransactions: ListTransactionsUseCase,
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly updateTransaction: UpdateTransactionUseCase,
    private readonly deleteTransaction: DeleteTransactionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List transactions for a month (default: current)' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListTransactionsQuery,
  ): Promise<TransactionWithRelations[]> {
    return this.listTransactions.execute({ userId: user.id, ...query });
  }

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionWithRelations> {
    return this.createTransaction.execute({ userId: user.id, ...dto });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionWithRelations> {
    return this.updateTransaction.execute({ userId: user.id, transactionId: id, ...dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    return this.deleteTransaction.execute(user.id, id);
  }
}

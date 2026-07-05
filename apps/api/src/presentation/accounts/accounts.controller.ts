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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Account } from '../../domain/entities/account.entity';
import type { AccountWithBalance } from '../../domain/repositories/account.repository';
import { CreateAccountUseCase } from '../../application/use-cases/accounts/create-account.use-case';
import { DeleteAccountUseCase } from '../../application/use-cases/accounts/delete-account.use-case';
import { ListAccountsUseCase } from '../../application/use-cases/accounts/list-accounts.use-case';
import { UpdateAccountUseCase } from '../../application/use-cases/accounts/update-account.use-case';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly listAccounts: ListAccountsUseCase,
    private readonly createAccount: CreateAccountUseCase,
    private readonly updateAccount: UpdateAccountUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List accounts with computed balances' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<AccountWithBalance[]> {
    return this.listAccounts.execute(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an account' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAccountDto): Promise<Account> {
    return this.createAccount.execute({ userId: user.id, ...dto });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename or retype an account' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ): Promise<Account> {
    return this.updateAccount.execute({ userId: user.id, accountId: id, ...dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account and its transactions' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    return this.deleteAccount.execute(user.id, id);
  }
}

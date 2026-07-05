import { Injectable } from '@nestjs/common';
import type { Account as PrismaAccount } from '@prisma/client';
import type { Account, AccountType } from '../../../domain/entities/account.entity';
import type {
  AccountRepository,
  AccountWithBalance,
  CreateAccountData,
  UpdateAccountData,
} from '../../../domain/repositories/account.repository';
import { PrismaService } from '../prisma.service';

function toAccount(record: PrismaAccount): Account {
  return { ...record, type: record.type as AccountType };
}

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByUser(userId: string): Promise<AccountWithBalance[]> {
    const [accounts, sums] = await Promise.all([
      this.prisma.account.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.transaction.groupBy({
        by: ['accountId', 'type'],
        where: { userId },
        _sum: { amountCents: true },
      }),
    ]);

    const balances = new Map<string, number>();
    for (const row of sums) {
      const signed = (row.type === 'income' ? 1 : -1) * (row._sum.amountCents ?? 0);
      balances.set(row.accountId, (balances.get(row.accountId) ?? 0) + signed);
    }

    return accounts.map((account) => ({
      ...toAccount(account),
      balanceCents: balances.get(account.id) ?? 0,
    }));
  }

  async findByIdForUser(id: string, userId: string): Promise<Account | null> {
    const record = await this.prisma.account.findFirst({ where: { id, userId } });
    return record ? toAccount(record) : null;
  }

  async findByNameForUser(name: string, userId: string): Promise<Account | null> {
    const record = await this.prisma.account.findFirst({ where: { name, userId } });
    return record ? toAccount(record) : null;
  }

  async create(data: CreateAccountData): Promise<Account> {
    return toAccount(await this.prisma.account.create({ data }));
  }

  async update(id: string, data: UpdateAccountData): Promise<Account> {
    return toAccount(await this.prisma.account.update({ where: { id }, data }));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.account.delete({ where: { id } });
  }
}

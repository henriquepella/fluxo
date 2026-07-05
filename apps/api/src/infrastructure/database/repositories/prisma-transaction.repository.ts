import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { CategoryKind } from '../../../domain/entities/category.entity';
import type { Transaction, TransactionType } from '../../../domain/entities/transaction.entity';
import type {
  CategoryTotal,
  CreateTransactionData,
  PeriodTotals,
  TransactionFilters,
  TransactionRepository,
  TransactionWithRelations,
  UpdateTransactionData,
} from '../../../domain/repositories/transaction.repository';
import { PrismaService } from '../prisma.service';

const RELATION_INCLUDE = {
  account: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, color: true, kind: true } },
} satisfies Prisma.TransactionInclude;

type TransactionRecord = Prisma.TransactionGetPayload<{ include: typeof RELATION_INCLUDE }>;

function toTransaction(record: TransactionRecord): TransactionWithRelations {
  const { account, category, ...transaction } = record;
  return {
    ...transaction,
    type: transaction.type as TransactionType,
    account,
    category: category ? { ...category, kind: category.kind as CategoryKind } : null,
  };
}

function dateFilter(from?: Date, to?: Date): Prisma.DateTimeFilter | undefined {
  if (!from && !to) return undefined;
  return { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) };
}

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByUser(
    userId: string,
    filters: TransactionFilters,
  ): Promise<TransactionWithRelations[]> {
    const records = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: dateFilter(filters.from, filters.to),
        accountId: filters.accountId,
        categoryId: filters.categoryId,
        type: filters.type,
      },
      include: RELATION_INCLUDE,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    return records.map(toTransaction);
  }

  async findByIdForUser(id: string, userId: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findFirst({ where: { id, userId } });
    return record ? { ...record, type: record.type as TransactionType } : null;
  }

  async create(data: CreateTransactionData): Promise<TransactionWithRelations> {
    const record = await this.prisma.transaction.create({ data, include: RELATION_INCLUDE });
    return toTransaction(record);
  }

  async update(id: string, data: UpdateTransactionData): Promise<TransactionWithRelations> {
    const record = await this.prisma.transaction.update({
      where: { id },
      data,
      include: RELATION_INCLUDE,
    });
    return toTransaction(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } });
  }

  async totalsByType(userId: string, from?: Date, to?: Date): Promise<PeriodTotals> {
    const rows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, date: dateFilter(from, to) },
      _sum: { amountCents: true },
    });

    const totals: PeriodTotals = { incomeCents: 0, expenseCents: 0 };
    for (const row of rows) {
      if (row.type === 'income') totals.incomeCents = row._sum.amountCents ?? 0;
      if (row.type === 'expense') totals.expenseCents = row._sum.amountCents ?? 0;
    }
    return totals;
  }

  async expenseByCategory(userId: string, from: Date, to: Date): Promise<CategoryTotal[]> {
    const rows = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'expense', date: dateFilter(from, to) },
      _sum: { amountCents: true },
    });

    const categoryIds = rows.map((row) => row.categoryId).filter((id): id is string => id !== null);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true },
    });
    const byId = new Map(categories.map((category) => [category.id, category]));

    return rows
      .map((row) => {
        const category = row.categoryId ? byId.get(row.categoryId) : undefined;
        return {
          categoryId: row.categoryId,
          name: category?.name ?? 'Sem categoria',
          color: category?.color ?? '#94a3b8',
          totalCents: row._sum.amountCents ?? 0,
        };
      })
      .sort((a, b) => b.totalCents - a.totalCents);
  }
}

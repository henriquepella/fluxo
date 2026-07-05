import { Injectable } from '@nestjs/common';
import type { Budget } from '../../../domain/entities/budget.entity';
import type {
  BudgetRepository,
  BudgetWithCategory,
  CreateBudgetData,
} from '../../../domain/repositories/budget.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaBudgetRepository implements BudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByUser(userId: string): Promise<BudgetWithCategory[]> {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  findByIdForUser(id: string, userId: string): Promise<Budget | null> {
    return this.prisma.budget.findFirst({ where: { id, userId } });
  }

  findByCategoryForUser(categoryId: string, userId: string): Promise<Budget | null> {
    return this.prisma.budget.findFirst({ where: { categoryId, userId } });
  }

  create(data: CreateBudgetData): Promise<Budget> {
    return this.prisma.budget.create({ data });
  }

  updateAmount(id: string, amountCents: number): Promise<Budget> {
    return this.prisma.budget.update({ where: { id }, data: { amountCents } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budget.delete({ where: { id } });
  }
}

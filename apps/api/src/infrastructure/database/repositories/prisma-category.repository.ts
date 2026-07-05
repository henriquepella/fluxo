import { Injectable } from '@nestjs/common';
import type { Category as PrismaCategory } from '@prisma/client';
import type { Category, CategoryKind } from '../../../domain/entities/category.entity';
import type {
  CategoryRepository,
  CreateCategoryData,
  UpdateCategoryData,
} from '../../../domain/repositories/category.repository';
import { PrismaService } from '../prisma.service';

function toCategory(record: PrismaCategory): Category {
  return { ...record, kind: record.kind as CategoryKind };
}

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByUser(userId: string): Promise<Category[]> {
    const records = await this.prisma.category.findMany({
      where: { userId },
      orderBy: [{ kind: 'asc' }, { name: 'asc' }],
    });
    return records.map(toCategory);
  }

  async findByIdForUser(id: string, userId: string): Promise<Category | null> {
    const record = await this.prisma.category.findFirst({ where: { id, userId } });
    return record ? toCategory(record) : null;
  }

  async findByNameAndKindForUser(
    name: string,
    kind: CategoryKind,
    userId: string,
  ): Promise<Category | null> {
    const record = await this.prisma.category.findFirst({ where: { name, kind, userId } });
    return record ? toCategory(record) : null;
  }

  async create(data: CreateCategoryData): Promise<Category> {
    return toCategory(await this.prisma.category.create({ data }));
  }

  async createMany(data: CreateCategoryData[]): Promise<void> {
    await this.prisma.category.createMany({ data });
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    return toCategory(await this.prisma.category.update({ where: { id }, data }));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}

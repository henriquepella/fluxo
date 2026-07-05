import type { Category, CategoryKind } from '../entities/category.entity';

export const CATEGORY_REPOSITORY = Symbol('CategoryRepository');

export interface CreateCategoryData {
  userId: string;
  name: string;
  kind: CategoryKind;
  color: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
}

export interface CategoryRepository {
  findManyByUser(userId: string): Promise<Category[]>;
  findByIdForUser(id: string, userId: string): Promise<Category | null>;
  findByNameAndKindForUser(
    name: string,
    kind: CategoryKind,
    userId: string,
  ): Promise<Category | null>;
  create(data: CreateCategoryData): Promise<Category>;
  createMany(data: CreateCategoryData[]): Promise<void>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
}

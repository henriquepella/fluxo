import { Inject, Injectable } from '@nestjs/common';
import type { Category } from '../../../domain/entities/category.entity';
import { ResourceConflictException } from '../../../domain/exceptions/resource-conflict.exception';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../../domain/repositories/category.repository';

export interface UpdateCategoryInput {
  userId: string;
  categoryId: string;
  name?: string;
  color?: string;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<Category> {
    const category = await this.categories.findByIdForUser(input.categoryId, input.userId);
    if (!category) {
      throw new ResourceNotFoundException('Category', input.categoryId);
    }

    const name = input.name?.trim();
    if (name && name !== category.name) {
      const duplicate = await this.categories.findByNameAndKindForUser(
        name,
        category.kind,
        input.userId,
      );
      if (duplicate && duplicate.id !== category.id) {
        throw new ResourceConflictException(
          `A ${category.kind} category named "${name}" already exists`,
        );
      }
    }

    return this.categories.update(category.id, { name, color: input.color });
  }
}

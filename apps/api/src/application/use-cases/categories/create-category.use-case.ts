import { Inject, Injectable } from '@nestjs/common';
import type { Category, CategoryKind } from '../../../domain/entities/category.entity';
import { ResourceConflictException } from '../../../domain/exceptions/resource-conflict.exception';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../../domain/repositories/category.repository';

export interface CreateCategoryInput {
  userId: string;
  name: string;
  kind: CategoryKind;
  color: string;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const name = input.name.trim();

    if (await this.categories.findByNameAndKindForUser(name, input.kind, input.userId)) {
      throw new ResourceConflictException(
        `A ${input.kind} category named "${name}" already exists`,
      );
    }

    return this.categories.create({
      userId: input.userId,
      name,
      kind: input.kind,
      color: input.color,
    });
  }
}

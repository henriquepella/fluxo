import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../../domain/repositories/category.repository';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  async execute(userId: string, categoryId: string): Promise<void> {
    const category = await this.categories.findByIdForUser(categoryId, userId);
    if (!category) {
      throw new ResourceNotFoundException('Category', categoryId);
    }
    await this.categories.delete(category.id);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { Category } from '../../../domain/entities/category.entity';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../../domain/repositories/category.repository';

@Injectable()
export class ListCategoriesUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  execute(userId: string): Promise<Category[]> {
    return this.categories.findManyByUser(userId);
  }
}

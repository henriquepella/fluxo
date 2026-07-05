import { Module } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/create-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/delete-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/categories/list-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/update-category.use-case';
import { RepositoriesModule } from '../../infrastructure/database/repositories.module';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [RepositoriesModule],
  controllers: [CategoriesController],
  providers: [
    ListCategoriesUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
})
export class CategoriesModule {}

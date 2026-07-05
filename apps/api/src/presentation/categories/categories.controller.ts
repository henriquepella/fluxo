import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Category } from '../../domain/entities/category.entity';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/create-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/delete-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/categories/list-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/update-category.use-case';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly listCategories: ListCategoriesUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List categories' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<Category[]> {
    return this.listCategories.execute(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ): Promise<Category> {
    return this.createCategory.execute({ userId: user.id, ...dto });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename or recolor a category' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.updateCategory.execute({ userId: user.id, categoryId: id, ...dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category (transactions keep no category)' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    return this.deleteCategory.execute(user.id, id);
  }
}

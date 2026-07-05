import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { CATEGORY_KINDS, type CategoryKind } from '../../../domain/entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Pets' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ enum: CATEGORY_KINDS, example: 'expense' })
  @IsIn(CATEGORY_KINDS)
  kind!: CategoryKind;

  @ApiProperty({ example: '#f59e0b', description: 'Hex color (#rgb or #rrggbb)' })
  @Matches(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: 'color must be a hex color' })
  color!: string;
}

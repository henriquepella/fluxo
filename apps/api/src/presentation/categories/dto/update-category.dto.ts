import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/** `kind` is immutable — changing it would silently reclassify past transactions. */
export class UpdateCategoryDto extends PartialType(OmitType(CreateCategoryDto, ['kind'])) {}

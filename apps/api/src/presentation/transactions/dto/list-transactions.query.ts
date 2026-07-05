import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import {
  TRANSACTION_TYPES,
  type TransactionType,
} from '../../../domain/entities/transaction.entity';

export class ListTransactionsQuery {
  @ApiPropertyOptional({ example: '2026-07', description: 'Defaults to the current month' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: TRANSACTION_TYPES })
  @IsOptional()
  @IsIn(TRANSACTION_TYPES)
  type?: TransactionType;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  TRANSACTION_TYPES,
  type TransactionType,
} from '../../../domain/entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ enum: TRANSACTION_TYPES, example: 'expense' })
  @IsIn(TRANSACTION_TYPES)
  type!: TransactionType;

  @ApiProperty({ example: 'Supermercado' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description!: string;

  @ApiProperty({ example: 15990, description: 'Amount in integer cents (always positive)' })
  @IsInt()
  @Min(1)
  amountCents!: number;

  @ApiProperty({ example: '2026-07-04' })
  @IsDate()
  @Type(() => Date)
  date!: Date;

  @ApiProperty({ example: 'ckxyz...' })
  @IsString()
  @MinLength(1)
  accountId!: string;

  @ApiPropertyOptional({ example: 'ckxyz...', nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string | null;
}

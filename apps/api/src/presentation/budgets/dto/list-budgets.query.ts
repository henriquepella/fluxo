import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class ListBudgetsQuery {
  @ApiPropertyOptional({ example: '2026-07', description: 'Defaults to the current month' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month?: string;
}

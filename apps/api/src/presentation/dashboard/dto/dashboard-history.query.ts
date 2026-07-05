import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class DashboardHistoryQuery {
  @ApiPropertyOptional({ example: 6, minimum: 2, maximum: 24, default: 6 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(24)
  months?: number;
}

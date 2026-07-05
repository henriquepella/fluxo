import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateBudgetDto {
  @ApiProperty({ example: 90000, description: 'Monthly limit in integer cents' })
  @IsInt()
  @Min(1)
  amountCents!: number;
}

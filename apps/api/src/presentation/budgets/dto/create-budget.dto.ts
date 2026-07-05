import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({ example: 'ckxyz...' })
  @IsString()
  @MinLength(1)
  categoryId!: string;

  @ApiProperty({ example: 80000, description: 'Monthly limit in integer cents' })
  @IsInt()
  @Min(1)
  amountCents!: number;
}

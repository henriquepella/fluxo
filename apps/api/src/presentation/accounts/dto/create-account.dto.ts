import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ACCOUNT_TYPES, type AccountType } from '../../../domain/entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'Nubank' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ enum: ACCOUNT_TYPES, example: 'checking' })
  @IsIn(ACCOUNT_TYPES)
  type!: AccountType;
}

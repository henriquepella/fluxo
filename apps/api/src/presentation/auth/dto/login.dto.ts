import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'henrique@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'S3nh4-forte' })
  @IsString()
  @MinLength(1)
  password!: string;
}

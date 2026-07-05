import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PublicUser } from '../../domain/entities/user.entity';
import { GetProfileUseCase } from '../../application/use-cases/auth/get-profile.use-case';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case';
import {
  AuthResult,
  RegisterUserUseCase,
} from '../../application/use-cases/auth/register-user.use-case';
import { CurrentUser, type AuthenticatedUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly getProfile: GetProfileUseCase,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create an account and receive an access token' })
  register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.registerUser.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive an access token' })
  login(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.loginUser.execute(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<PublicUser> {
    return this.getProfile.execute(user.id);
  }
}

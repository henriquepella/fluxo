import { Module } from '@nestjs/common';
import { GetProfileUseCase } from '../../application/use-cases/auth/get-profile.use-case';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case';
import { RepositoriesModule } from '../../infrastructure/database/repositories.module';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [RepositoriesModule, SecurityModule],
  controllers: [AuthController],
  providers: [RegisterUserUseCase, LoginUserUseCase, GetProfileUseCase],
})
export class AuthModule {}

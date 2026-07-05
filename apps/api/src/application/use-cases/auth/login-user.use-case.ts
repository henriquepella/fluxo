import { Inject, Injectable } from '@nestjs/common';
import { toPublicUser } from '../../../domain/entities/user.entity';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { USER_REPOSITORY, type UserRepository } from '../../../domain/repositories/user.repository';
import { PASSWORD_HASHER, type PasswordHasher } from '../../ports/password-hasher';
import { TOKEN_SIGNER, type TokenSigner } from '../../ports/token-signer';
import type { AuthResult } from './register-user.use-case';

export interface LoginUserInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SIGNER) private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }

    const accessToken = await this.tokenSigner.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return { user: toPublicUser(user), accessToken };
  }
}

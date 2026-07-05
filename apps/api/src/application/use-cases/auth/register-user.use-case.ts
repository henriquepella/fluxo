import { Inject, Injectable } from '@nestjs/common';
import { DEFAULT_CATEGORIES } from '../../../domain/entities/category.entity';
import { PublicUser, toPublicUser } from '../../../domain/entities/user.entity';
import { EmailAlreadyInUseException } from '../../../domain/exceptions/email-already-in-use.exception';
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from '../../../domain/repositories/account.repository';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../../domain/repositories/category.repository';
import { USER_REPOSITORY, type UserRepository } from '../../../domain/repositories/user.repository';
import { PASSWORD_HASHER, type PasswordHasher } from '../../ports/password-hasher';
import { TOKEN_SIGNER, type TokenSigner } from '../../ports/token-signer';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository,
    @Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SIGNER) private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();

    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyInUseException(email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.users.create({ email, name: input.name.trim(), passwordHash });

    // Seed sensible defaults so the app is usable right after sign-up.
    await this.categories.createMany(
      DEFAULT_CATEGORIES.map((category) => ({ ...category, userId: user.id })),
    );
    await this.accounts.create({ userId: user.id, name: 'Carteira', type: 'wallet' });

    const accessToken = await this.tokenSigner.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return { user: toPublicUser(user), accessToken };
  }
}

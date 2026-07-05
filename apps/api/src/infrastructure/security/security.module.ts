import { Module } from '@nestjs/common';
import { PASSWORD_HASHER } from '../../application/ports/password-hasher';
import { TOKEN_SIGNER } from '../../application/ports/token-signer';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';
import { JwtTokenSigner } from './jwt-token-signer';

/** Binds application security ports to their concrete adapters. */
@Module({
  providers: [
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SIGNER, useClass: JwtTokenSigner },
  ],
  exports: [PASSWORD_HASHER, TOKEN_SIGNER],
})
export class SecurityModule {}

export const TOKEN_SIGNER = Symbol('TokenSigner');

export interface AccessTokenPayload {
  /** User id. */
  sub: string;
  email: string;
  name: string;
}

export interface TokenSigner {
  sign(payload: AccessTokenPayload): Promise<string>;
}

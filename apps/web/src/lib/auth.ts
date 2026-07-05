const TOKEN_COOKIE = 'fluxo_token';
const NAME_COOKIE = 'fluxo_name';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // mirrors the API's 7d token lifetime

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getToken(): string | null {
  return readCookie(TOKEN_COOKIE);
}

export function getUserName(): string | null {
  return readCookie(NAME_COOKIE);
}

export function storeSession(token: string, userName: string): void {
  const attrs = `path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; ${attrs}`;
  document.cookie = `${NAME_COOKIE}=${encodeURIComponent(userName)}; ${attrs}`;
}

export function clearSession(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${NAME_COOKIE}=; path=/; max-age=0`;
}

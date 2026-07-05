import { NodeEnv, validateEnv } from './env.validation';

const validEnv: Record<string, unknown> = {
  NODE_ENV: 'test',
  PORT: '3001',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
  CORS_ORIGIN: 'http://localhost:3000',
  JWT_SECRET: 'test-only-jwt-secret',
};

describe('validateEnv', () => {
  it('accepts a valid configuration and coerces types', () => {
    const result = validateEnv(validEnv);

    expect(result.NODE_ENV).toBe(NodeEnv.Test);
    expect(result.PORT).toBe(3001);
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL);
  });

  it('applies defaults for optional variables', () => {
    const env = { ...validEnv };
    delete env.NODE_ENV;
    delete env.PORT;
    delete env.CORS_ORIGIN;

    const result = validateEnv(env);

    expect(result.NODE_ENV).toBe(NodeEnv.Development);
    expect(result.PORT).toBe(3001);
    expect(result.CORS_ORIGIN).toBe('http://localhost:3000');
  });

  it('rejects when DATABASE_URL is missing', () => {
    const env = { ...validEnv };
    delete env.DATABASE_URL;

    expect(() => validateEnv(env)).toThrow(/DATABASE_URL/);
  });

  it('rejects when REDIS_URL is missing', () => {
    const env = { ...validEnv };
    delete env.REDIS_URL;

    expect(() => validateEnv(env)).toThrow(/REDIS_URL/);
  });

  it('rejects when JWT_SECRET is missing', () => {
    const env = { ...validEnv };
    delete env.JWT_SECRET;

    expect(() => validateEnv(env)).toThrow(/JWT_SECRET/);
  });

  it('rejects a too-short JWT_SECRET', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });

  it('rejects a non-numeric PORT', () => {
    expect(() => validateEnv({ ...validEnv, PORT: 'not-a-port' })).toThrow(/PORT/);
  });

  it('rejects an out-of-range PORT', () => {
    expect(() => validateEnv({ ...validEnv, PORT: '70000' })).toThrow(/PORT/);
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() => validateEnv({ ...validEnv, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});

import { validateEnvironmentOrThrow } from './env.validation';

const validEnv: NodeJS.ProcessEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_NAME: 'copilotkit',
  JWT_SECRET: 'secret',
  FRONTEND_URL: 'http://localhost:3000',
  PORT: '3500',
};

describe('validateEnvironmentOrThrow', () => {
  it('does not throw for valid environment', () => {
    expect(() => validateEnvironmentOrThrow(validEnv)).not.toThrow();
  });

  it('throws when required keys are missing', () => {
    const brokenEnv = { ...validEnv, JWT_SECRET: '' };
    expect(() => validateEnvironmentOrThrow(brokenEnv)).toThrow(
      'Missing required environment variables: JWT_SECRET',
    );
  });

  it('throws when DB_PORT is invalid', () => {
    const brokenEnv = { ...validEnv, DB_PORT: 'abc' };
    expect(() => validateEnvironmentOrThrow(brokenEnv)).toThrow(
      'Invalid DB_PORT value: "abc"',
    );
  });
});

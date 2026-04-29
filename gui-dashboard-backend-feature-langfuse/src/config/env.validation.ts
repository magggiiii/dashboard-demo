const REQUIRED_ENV_KEYS = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'FRONTEND_URL',
  'PORT',
] as const;

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim().length === 0;
}

export function validateEnvironmentOrThrow(env: NodeJS.ProcessEnv): void {
  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => isBlank(env[key]));

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(', ')}`,
    );
  }

  const dbPort = Number(env.DB_PORT);
  const appPort = Number(env.PORT);

  if (!Number.isInteger(dbPort) || dbPort <= 0) {
    throw new Error(`Invalid DB_PORT value: "${env.DB_PORT}"`);
  }

  if (!Number.isInteger(appPort) || appPort <= 0) {
    throw new Error(`Invalid PORT value: "${env.PORT}"`);
  }
}

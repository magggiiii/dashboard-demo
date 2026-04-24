export const isDebugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDebugEnabled) console.log('[LOG]', ...args);
  },
  info: (...args: any[]) => {
    if (isDebugEnabled) console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    if (isDebugEnabled) console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    // We typically always want to log errors, but add a prefix for consistency
    console.error('[ERROR]', ...args);
  },
  debug: (...args: any[]) => {
    if (isDebugEnabled) console.debug('[DEBUG]', ...args);
  }
};

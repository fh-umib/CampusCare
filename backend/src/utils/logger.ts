type LogLevel = 'info' | 'warn' | 'error';

function write(level: LogLevel, event: string, details: Record<string, unknown> = {}) {
  const entry = { timestamp: new Date().toISOString(), level, event, ...details };
  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
}

export const logger = {
  info: (event: string, details?: Record<string, unknown>) => write('info', event, details),
  warn: (event: string, details?: Record<string, unknown>) => write('warn', event, details),
  error: (event: string, details?: Record<string, unknown>) => write('error', event, details)
};

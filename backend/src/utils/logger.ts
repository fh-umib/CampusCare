type LogLevel = 'info' | 'error';

function write(level: LogLevel, event: string, details: Record<string, unknown> = {}) {
  const entry = { timestamp: new Date().toISOString(), level, event, ...details };
  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else console.log(output);
}

export const logger = {
  info: (event: string, details?: Record<string, unknown>) => write('info', event, details),
  error: (event: string, details?: Record<string, unknown>) => write('error', event, details)
};

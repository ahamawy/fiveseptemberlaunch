/**
 * Improved logger utility
 * Replaces console.log throughout codebase
 */

type LogData = Record<string, any>;

const isDev = process.env.NODE_ENV === 'development';

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: LogData) {
    // Always log errors, only log others in dev
    if (level === 'error' || isDev) {
      const prefix = this.context ? `[${this.context}]` : '';
      const fullMessage = `${prefix} ${message}`;
      
      switch(level) {
        case 'error':
          console.error(fullMessage, data || '');
          break;
        case 'warn':
          console.warn(fullMessage, data || '');
          break;
        case 'debug':
          if (isDev) console.debug(fullMessage, data || '');
          break;
        default:
          if (isDev) console.log(fullMessage, data || '');
      }
    }
  }

  debug(message: string, data?: LogData) {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogData) {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData) {
    this.log('warn', message, data);
  }

  error(message: string, error?: any) {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: isDev ? error.stack : undefined
    } : error;
    this.log('error', message, errorData);
  }
}

// Export singleton
export const logger = new Logger();

// Create contextual logger
export const createLogger = (context: string) => new Logger(context);
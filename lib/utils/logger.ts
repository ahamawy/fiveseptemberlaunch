/**
 * Logger utility for debugging and troubleshooting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private formatMessage(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack: level === 'error' ? new Error().stack : undefined,
    };
  }

  private log(entry: LogEntry) {
    // Store in memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const style = {
        debug: 'color: gray',
        info: 'color: blue',
        warn: 'color: orange',
        error: 'color: red; font-weight: bold',
      };

      console.log(
        `%c[${entry.level.toUpperCase()}] ${entry.timestamp} - ${entry.message}`,
        style[entry.level],
        entry.context || ''
      );

      if (entry.stack) {
        console.error(entry.stack);
      }
    }
  }

  debug(message: string, context?: any) {
    this.log(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: any) {
    this.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: any) {
    this.log(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: any) {
    this.log(this.formatMessage('error', message, context));
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new Logger();

// API Response logger
export function logApiResponse(url: string, status: number, data?: any, error?: any) {
  if (error) {
    logger.error(`API Error: ${url}`, { status, error: error.message || error });
  } else if (status >= 400) {
    logger.warn(`API Warning: ${url}`, { status, data });
  } else {
    logger.debug(`API Success: ${url}`, { status });
  }
}

// Performance logger
export function logPerformance(operation: string, startTime: number) {
  const duration = Date.now() - startTime;
  if (duration > 1000) {
    logger.warn(`Slow operation: ${operation}`, { duration: `${duration}ms` });
  } else {
    logger.debug(`Operation completed: ${operation}`, { duration: `${duration}ms` });
  }
}

// React Error Boundary logger
export function logReactError(error: Error, errorInfo: any) {
  logger.error('React Error Boundary caught error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
}
/**
 * Structured logging utility
 * Replaces console statements with proper logging levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    // In development, use console for immediate feedback
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'info' ? 'info' : 'log';
      
      if (context) {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context);
      } else {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
      }
    }

    // In production, you could send to a logging service
    // For now, we'll just use console.error for errors
    if (level === 'error' && !this.isDevelopment) {
      console.error(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
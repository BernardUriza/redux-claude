// 📝 SIMPLE LOGGER FOR COGNITIVE CORE
// Lightweight logging that can be configured or replaced
// Bernard Orozco 2025

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
  debug(message: string, context?: Record<string, any>): void
  info(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
}

/**
 * Simple console logger for development
 * Can be replaced with a more sophisticated logger in production
 */
class SimpleLogger implements Logger {
  private minLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

  private levelValues: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelValues[level] >= this.levelValues[this.minLevel]
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, context || '')
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, context || '')
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, context || '')
    }
  }

  error(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, context || '')
    }
  }
}

// Singleton instance
export const logger = new SimpleLogger()

// Allow replacing the logger
let customLogger: Logger | null = null

export function setLogger(newLogger: Logger): void {
  customLogger = newLogger
}

export function getLogger(): Logger {
  return customLogger || logger
}

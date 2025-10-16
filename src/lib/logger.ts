// 📝 STRUCTURED LOGGER - Production-Ready JSON Logging
// Zero dependencies, maximum performance
// Bernard Orozco 2025

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface LogContext {
  [key: string]: any
}

interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  context?: LogContext
  trace?: string
}

class StructuredLogger {
  private isDevelopment = process.env.NODE_ENV !== 'production'
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'info'

  private levelValues: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
    fatal: 50,
  }

  private colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    fatal: '\x1b[35m', // Magenta
    reset: '\x1b[0m',
  }

  private emojis = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    fatal: '💀',
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelValues[level] >= this.levelValues[this.minLevel]
  }

  private formatDevelopment(entry: LogEntry): string {
    const color = this.colors[entry.level]
    const emoji = this.emojis[entry.level]
    const reset = this.colors.reset

    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const contextStr = entry.context
      ? `\n   ${JSON.stringify(entry.context, null, 2).split('\n').join('\n   ')}`
      : ''

    return `${color}${emoji} [${entry.level.toUpperCase()}]${reset} ${timestamp} - ${entry.message}${contextStr}`
  }

  private formatProduction(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context: context && Object.keys(context).length > 0 ? context : undefined,
    }

    const formatted = this.isDevelopment
      ? this.formatDevelopment(entry)
      : this.formatProduction(entry)

    // Output based on level
    if (level === 'error' || level === 'fatal') {
      console.error(formatted)
    } else if (level === 'warn') {
      console.warn(formatted)
    } else {
      console.log(formatted)
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext | Error) {
    const ctx =
      context instanceof Error
        ? {
            errorName: context.name,
            errorMessage: context.message,
            stack: context.stack,
          }
        : context
    this.log('error', message, ctx)
  }

  fatal(message: string, context?: LogContext | Error) {
    const ctx =
      context instanceof Error
        ? {
            errorName: context.name,
            errorMessage: context.message,
            stack: context.stack,
          }
        : context
    this.log('fatal', message, ctx)
  }

  // Specialized medical logging methods
  medicalDecision(
    message: string,
    context: {
      sessionId: string
      urgencyLevel?: string
      protocol?: string
      [key: string]: any
    }
  ) {
    this.info(`🏥 MEDICAL DECISION: ${message}`, {
      ...context,
      category: 'medical',
    })
  }

  urgencyDetection(
    sessionId: string,
    result: {
      level: string
      protocol?: string
      triggered: boolean
      widowMaker?: boolean
      [key: string]: any
    }
  ) {
    const emoji = result.level === 'CRITICAL' ? '🚨' : result.level === 'HIGH' ? '⚡' : '📊'
    this.info(`${emoji} URGENCY DETECTION`, {
      sessionId,
      ...result,
      category: 'urgency',
    })
  }

  criticalPattern(
    sessionId: string,
    result: {
      triggered: boolean
      patterns: string[]
      urgencyOverride?: string
      widowMaker?: boolean
    }
  ) {
    if (result.triggered) {
      this.warn('🩸 CRITICAL PATTERN DETECTED', {
        sessionId,
        ...result,
        category: 'critical_pattern',
      })
    } else {
      this.debug('Critical pattern check', {
        sessionId,
        triggered: false,
      })
    }
  }

  reduxAction(action: { type: string; payload?: any; sessionId?: string }) {
    this.debug(`📝 Redux Action: ${action.type}`, {
      ...action,
      category: 'redux',
    })
  }

  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`📨 ${method} ${path}`, {
      ...context,
      category: 'api',
    })
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    this[level](`✅ ${method} ${path} ${statusCode}`, {
      statusCode,
      duration: `${duration}ms`,
      category: 'api',
    })
  }
}

// Singleton instance
export const logger = new StructuredLogger()

// Type exports
export type { LogLevel, LogContext, LogEntry }

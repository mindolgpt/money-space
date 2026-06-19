type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogEntry = {
  timestamp: string
  level: LogLevel
  message: string
  data?: Record<string, any>
  context?: string
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const isDevelopment = process.env.NODE_ENV !== 'production'

class Logger {
  private logs: LogEntry[] = []
  private minLevel: LogLevel = isDevelopment ? 'debug' : 'info'
  private maxLogs = 100

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel]
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private addLog(entry: Omit<LogEntry, 'timestamp'>) {
    const fullEntry: LogEntry = {
      ...entry,
      timestamp: this.formatTimestamp(),
    }

    this.logs.push(fullEntry)

    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    if (isDevelopment) {
      const prefix = `[${fullEntry.timestamp}] [${fullEntry.level.toUpperCase()}]`
      const contextStr = fullEntry.context ? ` [${fullEntry.context}]` : ''
      const dataStr = fullEntry.data ? ` ${JSON.stringify(fullEntry.data)}` : ''

      switch (fullEntry.level) {
        case 'error':
          console.error(`${prefix}${contextStr} ${fullEntry.message}${dataStr}`)
          break
        case 'warn':
          console.warn(`${prefix}${contextStr} ${fullEntry.message}${dataStr}`)
          break
        default:
          console.log(`${prefix}${contextStr} ${fullEntry.message}${dataStr}`)
      }
    }
  }

  setLevel(level: LogLevel) {
    this.minLevel = level
  }

  debug(message: string, data?: Record<string, any>, context?: string) {
    if (this.shouldLog('debug')) {
      this.addLog({ level: 'debug', message, data, context })
    }
  }

  info(message: string, data?: Record<string, any>, context?: string) {
    if (this.shouldLog('info')) {
      this.addLog({ level: 'info', message, data, context })
    }
  }

  warn(message: string, data?: Record<string, any>, context?: string) {
    if (this.shouldLog('warn')) {
      this.addLog({ level: 'warn', message, data, context })
    }
  }

  error(message: string, data?: Record<string, any>, context?: string) {
    if (this.shouldLog('error')) {
      this.addLog({ level: 'error', message, data, context })
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const logger = new Logger()

export function createContextLogger(context: string) {
  return {
    debug: (message: string, data?: Record<string, any>) =>
      logger.debug(message, data, context),
    info: (message: string, data?: Record<string, any>) =>
      logger.info(message, data, context),
    warn: (message: string, data?: Record<string, any>) =>
      logger.warn(message, data, context),
    error: (message: string, data?: Record<string, any>) =>
      logger.error(message, data, context),
  }
}
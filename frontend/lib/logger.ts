class FrontendLogger {
  private isDebug: boolean;
  private isDevelopment: boolean;
  private logLevel: string;

  constructor() {
    this.isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'info';
  }

  private shouldLog(level: string): boolean {
    if (!this.isDebug && this.isDevelopment) return false;
    return true;
  }

  private getTimestamp(): string {
    return new Date().toLocaleTimeString();
  }

  private formatMessage(level: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const timestamp = this.getTimestamp();
    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'debug' ? '🔧' : 'ℹ️';
    
    if (this.isDevelopment) {
      // Development: Colorful logs with emojis
      const style = level === 'error' ? 'color: #ff6b6b; font-weight: bold' : 
                   level === 'warn' ? 'color: #ffa500; font-weight: bold' : 
                   level === 'debug' ? 'color: #74c0fc; font-weight: bold' : 
                   'color: #51cf66; font-weight: bold';
      
      console.log(`%c${emoji} [${timestamp}] ${message}`, style);
      if (data) console.log(data);
    } else {
      // Production: Structured JSON logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(data && { data })
      };
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, data?: any) {
    this.formatMessage('info', message, data);
  }

  error(message: string, error?: any) {
    this.formatMessage('error', message, error);
  }

  warn(message: string, data?: any) {
    this.formatMessage('warn', message, data);
  }

  debug(message: string, data?: any) {
    this.formatMessage('debug', message, data);
  }

  // Méthodes utilitaires spécifiques
  logEnvironment() {
    if (this.isDebug) {
      this.info('🔧 Frontend Environment Configuration');
      this.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      this.info(`   Debug mode: ${this.isDebug}`);
      this.info(`   Log level: ${this.logLevel}`);
      this.info(`   API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
      this.info(`   Socket URL: ${process.env.NEXT_PUBLIC_SOCKET_URL}`);
    }
  }

  logWebSocket(event: string, data?: any) {
    if (this.isDebug) {
      this.debug(`🔌 WebSocket ${event}`, data);
    }
  }

  logWebSocketError(message: string, error?: any) {
    // Log WebSocket errors only in debug mode to avoid spam
    if (this.isDebug) {
      this.error(`🚫 WebSocket Error: ${message}`, error);
    }
  }

  logApi(method: string, url: string, status?: number) {
    if (this.isDebug) {
      const emoji = status && status >= 400 ? '❌' : '✅';
      this.debug(`${emoji} API ${method.toUpperCase()} ${url}${status ? ` - ${status}` : ''}`);
    }
  }

  logNavigation(page: string) {
    if (this.isDebug) {
      this.debug(`📄 Navigate to ${page}`);
    }
  }
}

// Export singleton instance
export const frontendLogger = new FrontendLogger();
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;
  private isDebug: boolean;
  private isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDebug = this.configService.get<string>('DEBUG') === 'true';
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    this.logger = winston.createLogger({
      level: this.configService.get<string>('LOG_LEVEL') || 'info',
      format: this.isDevelopment ? this.developmentFormat() : this.productionFormat(),
      transports: this.getTransports(),
    });
  }

  private developmentFormat() {
    return winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        let output = `[${timestamp}] ${level}`;
        if (context) output += ` [${context}]`;
        output += `: ${message}`;
        
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return metaStr ? `${output}\n${metaStr}` : output;
      })
    );
  }

  private productionFormat() {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );
  }

  private getTransports(): winston.transport[] {
    const transports: winston.transport[] = [];

    if (this.isDevelopment) {
      // Development: Console only with colors
      transports.push(
        new winston.transports.Console({
          format: this.developmentFormat(),
        })
      );
    } else {
      // Production: Console + File
      transports.push(
        new winston.transports.Console({
          format: this.productionFormat(),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: this.productionFormat(),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: this.productionFormat(),
        })
      );
    }

    return transports;
  }

  log(message: any, context?: string) {
    if (this.isDebug || !this.isDevelopment) {
      this.logger.info(message, { context });
    }
  }

  error(message: any, trace?: string, context?: string) {
    if (this.isDebug || !this.isDevelopment) {
      this.logger.error(message, { trace, context });
    }
  }

  warn(message: any, context?: string) {
    if (this.isDebug || !this.isDevelopment) {
      this.logger.warn(message, { context });
    }
  }

  debug(message: any, context?: string) {
    if (this.isDebug) {
      this.logger.debug(message, { context });
    }
  }

  verbose(message: any, context?: string) {
    if (this.isDebug) {
      this.logger.verbose(message, { context });
    }
  }

  // Méthodes utilitaires pour les logs spécifiques
  logEnvironment() {
    if (this.isDebug) {
      this.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`, 'Config');
      this.log(`📁 Debug mode: ${this.isDebug}`, 'Config');
      this.log(`📊 Log level: ${this.configService.get<string>('LOG_LEVEL')}`, 'Config');
      this.log(`🌐 Frontend URL: ${this.configService.get<string>('FRONTEND_URL')}`, 'Config');
    }
  }

  logWebSocket(message: string, data?: any) {
    if (this.isDebug) {
      this.debug(`🔌 WebSocket: ${message}`, 'WebSocket');
      if (data) this.debug(data, 'WebSocket');
    }
  }

  logApi(method: string, url: string, status?: number) {
    if (this.isDebug) {
      const emoji = status && status >= 400 ? '❌' : '✅';
      this.debug(`${emoji} ${method.toUpperCase()} ${url}${status ? ` - ${status}` : ''}`, 'API');
    }
  }
}
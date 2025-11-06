import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggerModule {}
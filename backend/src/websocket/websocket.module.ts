import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
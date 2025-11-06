import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SheetsModule } from './sheets/sheets.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { WebsocketModule } from './websocket/websocket.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
      ignoreEnvFile: false,
      expandVariables: true,
      isGlobal: true,
    }),
    LoggerModule,
    PrismaModule,
    SheetsModule,
    RoomsModule,
    UsersModule,
    MembersModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

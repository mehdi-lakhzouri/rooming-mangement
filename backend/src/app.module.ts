import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SheetsModule } from './sheets/sheets.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
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

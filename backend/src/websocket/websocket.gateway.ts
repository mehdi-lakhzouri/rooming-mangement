import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Room events
  emitRoomCreated(room: any) {
    this.server.emit('room_created', room);
  }

  emitRoomDeleted(roomId: string) {
    this.server.emit('room_deleted', { roomId });
  }

  emitRoomUpdated(room: any) {
    this.server.emit('room_updated', room);
  }

  emitMemberJoined(roomId: string, member: any) {
    this.server.emit('member_joined', { roomId, member });
  }

  emitMemberLeft(roomId: string, memberId: string) {
    this.server.emit('member_left', { roomId, memberId });
  }

  // Sheet events
  emitSheetCreated(sheet: any) {
    this.server.emit('sheet_created', sheet);
  }

  emitSheetDeleted(sheetId: string) {
    this.server.emit('sheet_deleted', { sheetId });
  }
}
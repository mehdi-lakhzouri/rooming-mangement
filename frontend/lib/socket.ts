import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;

  connect(url: string = 'http://localhost:3001') {
    if (!this.socket) {
      this.socket = io(url, {
        autoConnect: true,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();
export const socket = socketManager.connect();
import { io, Socket } from 'socket.io-client';
import { config } from './config';
import { frontendLogger } from './logger';

class SocketManager {
  private socket: Socket | null = null;
  private errorCount: number = 0;
  private maxErrors: number = 3; // Limit error logging

  connect(url?: string) {
    if (!this.socket) {
      const socketUrl = url || config.socketUrl || 'http://localhost:3001';
      
      frontendLogger.logWebSocket('Connecting', { 
        url: socketUrl, 
        environment: config.environment 
      });
      
      this.socket = io(socketUrl, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
      });

      // Event listeners with controlled logging
      this.socket.on('connect', () => {
        this.errorCount = 0; // Reset error count on successful connection
        frontendLogger.logWebSocket('Connected', { id: this.socket?.id });
      });

      this.socket.on('disconnect', (reason) => {
        frontendLogger.logWebSocket('Disconnected', { reason });
      });

      this.socket.on('connect_error', (error) => {
        // Only log first few errors to prevent spam
        if (this.errorCount < this.maxErrors) {
          frontendLogger.logWebSocketError('Connection failed', {
            error: error.message,
            type: (error as any).type || 'unknown',
            count: this.errorCount + 1
          });
          this.errorCount++;
        } else if (this.errorCount === this.maxErrors) {
          frontendLogger.warn(`WebSocket errors suppressed (>${this.maxErrors}). Enable debug mode for full logs.`);
          this.errorCount++;
        }
      });

      this.socket.on('reconnect', () => {
        this.errorCount = 0; // Reset on reconnection
        frontendLogger.logWebSocket('Reconnected');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      frontendLogger.logWebSocket('Disconnecting');
      this.socket.disconnect();
      this.socket = null;
      this.errorCount = 0;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Reset error count manually if needed
  resetErrorCount() {
    this.errorCount = 0;
  }
}

export const socketManager = new SocketManager();
export const socket = socketManager.connect();
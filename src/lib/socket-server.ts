import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { redis } from './redis';

export class SocketServer {
  static getInstance(): SocketIOServer | null {
    return (global as any).io || null;
  }

  static async emitToUser(userId: string, event: string, data: any) {
    const io = this.getInstance();
    if (io) {
      io.to(`user:${userId}`).emit(event, data);
      console.log(`Emitted ${event} to user ${userId}`);
      
      try {
        if (redis) {
          await redis.publish(`notification:${userId}`, JSON.stringify({ event, data }));
        }
      } catch (error) {
        console.warn('Redis publish failed:', error instanceof Error ? error.message : String(error));
      }
    } else {
      console.warn('Socket.IO not initialized');
    }
  }

  static async emitToOwner(ownerId: string, event: string, data: any) {
    const io = this.getInstance();
    if (io) {
      io.to(`owner:${ownerId}`).emit(event, data);
      console.log(`Emitted ${event} to owner ${ownerId}`);
      
      try {
        if (redis) {
          await redis.publish(`owner-notification:${ownerId}`, JSON.stringify({ event, data }));
        }
      } catch (error) {
        console.warn('Redis publish failed for owner:', error instanceof Error ? error.message : String(error));
      }
    } else {
      console.warn('Socket.IO not initialized');
    }
  }
}
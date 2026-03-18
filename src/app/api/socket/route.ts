import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';

export async function GET(req: NextRequest) {
  if (!(global as any).io) {
    const io = new SocketIOServer({
      path: '/api/socket/io',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('join-user', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room`);
      });

      socket.on('join-owner', (ownerId: string) => {
        socket.join(`owner:${ownerId}`);
        console.log(`Owner ${ownerId} joined room`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    (global as any).io = io;
    console.log('Socket.IO server initialized');
  }

  return NextResponse.json({ message: 'Socket.IO server running' });
}
import { Server as SocketIOServer } from 'socket.io';
import { NextResponse } from 'next/server';
import type { SocketResponse, SocketServer } from '@/app/types/socket';

export async function GET() {
  try {
    if (!global.io) {
      const res = NextResponse.next() as unknown as SocketResponse;
      
      if (!res.socket?.server) {
        throw new Error('Server not initialized');
      }

      const socketServer = new SocketIOServer(res.socket.server, {
        path: '/api/socketio',
        addTrailingSlash: false,
        transports: ['websocket', 'polling'],
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      });

      global.io = socketServer as SocketServer;
      res.socket.server.io = global.io;

      console.log('Socket.IO server initialized');
    }
    
    return new NextResponse('Socket.IO server running');
  } catch (error) {
    console.error('Failed to start Socket.IO server:', error);
    return NextResponse.json(
      { error: 'Failed to start Socket.IO server' },
      { status: 500 }
    );
  }
}
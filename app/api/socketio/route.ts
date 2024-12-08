import { Server as SocketIOServer } from 'socket.io';
import { NextResponse } from 'next/server';
import type { SocketResponse, SocketServer } from '@/app/types/socket';

export async function GET() {
  try {
    const res = NextResponse.next() as unknown as SocketResponse;
    
    if (!global.io) {
      const io = new SocketIOServer(res.socket.server, {
        path: '/api/socketio',
        addTrailingSlash: false,
        transports: ['websocket', 'polling'],
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      }) as SocketServer;

      io._events = {};
      res.socket.server.io = io;
      global.io = io;
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
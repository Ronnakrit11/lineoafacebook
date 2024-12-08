import { NextResponse } from 'next/server';
import type { SocketResponse } from '@/app/types/socket';
import { initializeSocketServer } from '@/lib/socketServer';

export async function GET() {
  try {
    if (!global.io) {
      const res = NextResponse.next() as unknown as SocketResponse;
      
      if (!res.socket?.server) {
        throw new Error('HTTP Server not initialized');
      }

      initializeSocketServer(res.socket.server);
    }
    
    return new NextResponse('Socket.IO server running', { status: 200 });
  } catch (error) {
    console.error('Failed to start Socket.IO server:', error);
    return NextResponse.json(
      { error: 'Failed to start Socket.IO server' },
      { status: 500 }
    );
  }
}
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // @ts-ignore
    const res = NextResponse.next();
    
    let io: SocketIOServer;

    if (!(global as any).io) {
      io = new SocketIOServer((res as any).socket.server);
      (global as any).io = io;
    }
    
    return new NextResponse('Socket.IO server running');
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start Socket.IO server' },
      { status: 500 }
    );
  }
}
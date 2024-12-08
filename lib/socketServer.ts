import { Server as SocketIOServer } from 'socket.io';
import type { SocketServer, ServerSocket } from '@/app/types/socket';

let io: SocketServer | undefined;

export function initializeSocketServer(server: ServerSocket) {
  if (io) {
    console.log('Socket.IO server already initialized');
    return io;
  }

  try {
    io = new SocketIOServer(server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    global.io = io;
    server.io = io;

    console.log('Socket.IO server initialized successfully');
    return io;
  } catch (error) {
    console.error('Failed to initialize Socket.IO server:', error);
    throw error;
  }
}

export function getSocketServer(): SocketServer | undefined {
  return io;
}
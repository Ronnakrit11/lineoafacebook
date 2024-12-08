import { io } from 'socket.io-client';
import type { TypedClientSocket } from '@/app/types/socket';

let socket: TypedClientSocket | null = null;

export const initializeSocket = () => {
  if (typeof window === 'undefined') return null;
  
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || window.location.origin, {
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'],
    }) as TypedClientSocket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};
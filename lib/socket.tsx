import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initializeSocket = () => {
  socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000', {
    path: '/api/socketio',
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};
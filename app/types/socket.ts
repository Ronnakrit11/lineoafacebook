import type { Server as IOServer } from 'socket.io';
import type { Server as NetServer } from 'http';
import type { NextResponse } from 'next/server';
import type { Socket as ClientSocket } from 'socket.io-client';
import type { ConversationWithMessages } from './chat';
import type { EventEmitter } from 'events';

export interface ServerToClientEvents {
  messageReceived: (conversation: ConversationWithMessages) => void;
}

export interface ClientToServerEvents {
  messageReceived: (conversation: ConversationWithMessages) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
}

export type SocketServer = IOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> & EventEmitter;

export interface ServerSocket extends NetServer {
  io?: SocketServer;
}

export interface SocketResponse extends NextResponse {
  socket: {
    server: ServerSocket;
  };
}

export type TypedClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>;
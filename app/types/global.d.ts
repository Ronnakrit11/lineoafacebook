import type { SocketServer } from './socket';

declare global {
  const io: SocketServer | undefined;
}

export {};
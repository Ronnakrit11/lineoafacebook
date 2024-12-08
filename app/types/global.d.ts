import type { SocketServer } from './socket';

declare global {
  var io: SocketServer | undefined;
}

export {};
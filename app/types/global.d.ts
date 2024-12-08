import type { SocketServer } from './socket';

declare global {
  namespace NodeJS {
    interface Global {
      io: SocketServer | undefined;
    }
  }
}

export {};
import type { SocketServer } from './socket';

declare global {
  let io: SocketServer | undefined;
  
  namespace NodeJS {
    interface Global {
      io: SocketServer | undefined;
    }
  }
}

export {};
import type { SocketServer } from './socket';

declare global {
  var io: SocketServer | undefined;
  
  namespace NodeJS {
    interface Global {
      io: SocketServer | undefined;
    }
  }
}

export {};
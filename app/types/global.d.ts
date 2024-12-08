import type { SocketServer } from './socket';

declare global {
  // eslint-disable-next-line no-var
  var io: SocketServer | undefined;
}

export {};
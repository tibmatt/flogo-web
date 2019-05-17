import * as socketio from 'socket.io';
import { EngineLogStreamer } from './engine-log-streamer';
import { StreamSimulator } from './stream-simulator';

// TODO: inject config
export function init(server) {
  const io: socketio.Server = require('socket.io')(server);
  const sockets = new Set<socketio.Socket>();
  const engineLogStreamer = new EngineLogStreamer(io);
  const simulator = new StreamSimulator(io);

  io.on('connection', (ws: socketio.Socket) => {
    engineLogStreamer.registerClient(ws);

    sockets.add(ws);
    ws.on('close', () => {
      sockets.delete(ws);
    });
  });

  let closed = false;
  server.on('close', () => {
    if (closed) {
      return;
    }
    closed = true;
    io.close();
    // logStream.destroy();
    sockets.forEach(socket => socket.disconnect(true));
    sockets.clear();
  });
}

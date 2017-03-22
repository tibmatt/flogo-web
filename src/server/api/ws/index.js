import {engineLogger} from '../../common/logging';
const socketIo = require('socket.io');

// TODO: inject config
export function init(server) {
  const io = socketIo(server);
  const socketList = [];

  io.on('connection', ws => {
    socketList.push(ws);

    var options = {
      limit:10,
      start:0,
      order:'desc',
      fields: ['level','timestamp','message']
    };

    engineLogger.query(options, (err, results) => {
      if (err) {
        console.log(err) ;
      }
      var docs = results['file'] || [];
      ws.emit('on-connecting', JSON.stringify(docs));
    });

    ws.on('close', () => {
      socketList.splice(socketList.indexOf(ws), 1);
    });

  });

  const logStreamerListener = logData => {
    io.emit('on-log', JSON.stringify({
      level: logData.level,
      message: logData.message,
      timestamp: logData.timestamp
    }));
  };

  const logStream = engineLogger.stream({ start: -1 });
  logStream.on('log', logStreamerListener);

  let closed = false;
  server.on('close', () => {
    if (closed) {
      return;
    }
    closed = true;
    io.close();
    logStream.removeListener('log', logStreamerListener);
    logStream.destroy();
    socketList.forEach(socket => socket.destroy());
  });

}

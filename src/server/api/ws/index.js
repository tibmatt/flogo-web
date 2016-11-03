import {engineLogger} from '../../common/logger';

const WebSocketServer = require('ws').Server;

// TODO: inject config
export function init() {
  const wss = new WebSocketServer({port: 3011});

  // Broadcast to all.
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      client.send(data);
    });
  };

  engineLogger.stream({start: -1})
    .on('log', function (logData) {
      wss.broadcast(JSON.stringify({
        level: logData.level,
        message: logData.message,
        timestamp: logData.timestamp
      }));
    })
}

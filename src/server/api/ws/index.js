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


  wss.on('connection', (ws)=> {
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
      ws.send(JSON.stringify(docs));
    });

  });

  engineLogger.stream({start: -1})
    .on('log', function (logData) {
      wss.broadcast(JSON.stringify({
        level: logData.level,
        message: logData.message,
        timestamp: logData.timestamp
      }));
    })
}

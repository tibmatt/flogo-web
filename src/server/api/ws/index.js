import {engineLogger} from '../../common/logger';

// TODO: inject config
export function init(server) {
  const io = require('socket.io')(server);

  io.on('connection', (ws)=> {
    console.log('Connecting socket.io .........');
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

  });

  engineLogger.stream({start: -1})
    .on('log', function (logData) {
      io.emit('on-log',JSON.stringify({
        level: logData.level,
        message: logData.message,
        timestamp: logData.timestamp
      }));
    })
}

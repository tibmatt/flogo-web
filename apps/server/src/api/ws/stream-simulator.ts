import { createReadStream } from 'fs';
import { join } from 'path';
import * as socketio from 'socket.io';
import csvParser from 'csv-parse';
import transform from 'stream-transform';
import ReadStream = NodeJS.ReadStream;

enum Transport {
  Input = 'input',
  Output = 'output',
}

export class StreamSimulator {
  constructor(private server: socketio.Server) {
    server.of('/stream-simulator').on('connection', clientSocket => {
      let simulation: ValueStreamer;
      const clearPrevious = () => {
        if (simulation) {
          simulation.destroy();
          simulation = null;
        }
      };
      clientSocket.on('simulate-start', params => {
        clearPrevious();
        simulation = new ValueStreamer(clientSocket);
        simulation.start(params);
      });
      clientSocket.on('simulate-stop', clearPrevious);
      clientSocket.on('disconnect', clearPrevious);
    });
  }
}

const csvParse = () => csvParser({ skip_empty_lines: true, cast: true, columns: true });

const SAMPLES = {
  stream: {
    in: 'SensorDataNormalStructure.csv',
    out: 'model_output.csv',
  },
  ml: {
    in: 'normalized_input.csv',
    out: 'model_output.csv',
  },
};
class ValueStreamer {
  currentStreams: {
    input: ReadStream;
    output: ReadStream;
  };
  isDestroyed = false;
  constructor(private clientSocket: socketio.Socket) {
    console.log(`Created simulator instance for ${this.getClientId()}`);
  }

  private getClientId() {
    return this.clientSocket && this.clientSocket.id;
  }

  start({ simulationId, type }) {
    if (this.isDestroyed) {
      return;
    }
    if (!type || !SAMPLES[type]) {
      console.warn(`No sample of type ${type}`);
      return;
    }
    this.currentStreams = {
      input: this.configureStream(simulationId, SAMPLES[type].in, Transport.Input),
      output: this.configureStream(simulationId, SAMPLES[type].out, Transport.Output),
    };
  }

  destroy() {
    this.isDestroyed = true;
    if (this.currentStreams) {
      this.currentStreams.input.destroy();
      this.currentStreams.output.destroy();
      this.currentStreams = null;
    }
  }

  private configureStream(
    simulationId: number,
    fileName,
    transport: Transport
  ): ReadStream {
    const file = join(__dirname, 'samples', fileName);
    const stream = createReadStream(file)
      .pipe(csvParse())
      .pipe(
        transform({ parallel: 1 }, (record, callback) => {
          const destroyHandler: {
            destroy?: () => void;
          } = {};
          const timeout = setTimeout(() => {
            callback(null, { ...record, __simulationId: simulationId });
            stream.off('destroy', destroyHandler.destroy);
          }, 900);
          destroyHandler.destroy = () => clearTimeout(timeout);
          stream.on('destroy', destroyHandler.destroy);
        })
      );

    stream.on('data', record => {
      if (!this.isDestroyed) {
        this.emitValue(record, transport);
      }
    });

    return stream;
  }

  private emitValue(value, transport: Transport) {
    console.log('[SIM]: sending data to ' + this.getClientId(), value);
    this.clientSocket.emit('data', {
      transport,
      value,
    });
  }
}

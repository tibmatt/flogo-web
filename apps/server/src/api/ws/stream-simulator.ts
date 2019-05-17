import * as socketio from 'socket.io';
import * as faker from 'faker';
import { random } from 'lodash';

import { ValueType } from '@flogo-web/core';

export class StreamSimulator {
  constructor(private server: socketio.Server) {
    server.of('/stream-simulator').on('connection', clientSocket => {
      const simulation = new Simulation(clientSocket);
      clientSocket.on('simulate-start', params => simulation.start(params));
      clientSocket.on('simulate-stop', () => simulation.stop());
      clientSocket.on('disconnect', () => simulation.stop());
    });
  }
}

const getRandomInterval = random.bind(null, 1000);
class Simulation {
  private currentTimeout;

  constructor(private clientSocket: socketio.Socket) {
    console.log(`Created simulator instance for ${this.getClientId()}`);
  }

  start(props: { name: string; type: string }[]) {
    props = props || [];
    const fields = props.map(propToFieldGenerator).filter(Boolean);
    const getNextValue = () => fields.reduce(fieldReducer, {});
    this.scheduleNext(getNextValue);
  }

  stop() {
    if (this.currentTimeout) {
      console.log('[SIM]: stopping simulator ' + this.getClientId());
      clearTimeout(this.currentTimeout);
    }
  }

  private scheduleNext(getNextValue: () => any) {
    this.currentTimeout = setTimeout(() => {
      const nextValue = getNextValue();
      console.log('[SIM]: sending data to ' + this.getClientId(), nextValue);

      this.clientSocket.emit('data', nextValue);

      this.scheduleNext(getNextValue);
    }, getRandomInterval());
  }

  private getClientId() {
    return this.clientSocket && this.clientSocket.id;
  }
}

function fieldReducer(
  all: { [prop: string]: any },
  field: { name: string; generate: () => any }
) {
  all[field.name] = field.generate();
  return all;
}

function propToFieldGenerator(prop: { name: string; type: ValueType }) {
  if (!prop || !prop.name || !prop.type) {
    return null;
  }
  let generate;
  switch (prop.type) {
    case ValueType.Double:
    case ValueType.Integer:
    case ValueType.Long:
      generate = faker.random.number;
      break;
    case ValueType.Boolean:
      generate = faker.random.boolean;
      break;
    default:
      generate = faker.random.word;
      break;
  }

  return { name: prop.name, generate };
}

import * as io from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';
import { Injectable, OnDestroy, Inject } from '@angular/core';

import { HOSTNAME } from '@flogo-web/lib-client/core';

@Injectable()
export class SimulatorService implements OnDestroy {
  private readonly socket: SocketIOClient.Socket;
  public readonly data$: Observable<any>;

  constructor(@Inject(HOSTNAME) hostname: string) {
    this.socket = io.connect(`${hostname}/stream-simulator`);
    this.data$ = fromEvent(this.socket, 'data');
  }

  ngOnDestroy() {
    console.log('disconnecting');
    this.socket.disconnect();
  }

  startSimulation(props) {
    this.socket.emit('simulate-start', props);
  }

  stopSimulation() {
    this.socket.emit('simulate-stop');
  }
}

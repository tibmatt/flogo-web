import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as io from 'socket.io-client';
@Injectable()
export class LogService {
    // TODO define config interface
    public lines: any[];

    constructor() {
        this.lines = [];
        let socket = io(environment.hostname);
        socket.on('on-connecting', this.onData.bind(this));
        socket.on('on-log', this.onData.bind(this));
    }

    onData(msg) {
        try {
            let data = JSON.parse(msg);
            this.appendLog(data);
        } catch(e) {
            console.error(e);
        }
    }

    appendLog(logData) {
        if(logData.length) {
            logData.forEach((data)=> {
              // split lines
              let lines = (data.message || '').match(/[^\r\n]+/g);
              lines.forEach((line) => {
                this.addLine(Object.assign({}, data, {message: line}));
              });
            });
        } else {
            this.addLine(logData);
        }

        this.lines = this.lines.slice();
    }

    addLine(data) {
        let message = {
            level: data.level,
            timestamp: moment(data.timestamp).format('HH:mm:ss.SSS ll'),
            message: data.message
        };

        this.lines.unshift(message);
    }


}

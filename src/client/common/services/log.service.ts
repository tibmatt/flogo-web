import { Injectable } from '@angular/core';

@Injectable()
export class LogService {
    // TODO define config interface
    public lines: any[];

    constructor() {
        this.lines = [];
        var socket = io();
        socket.on('on-connecting', this.onData.bind(this));
        socket.on('on-log', this.onData.bind(this));
    }

    onData(msg) {
        console.info('Received message', new Date());
        try {
            var data = JSON.parse(msg);
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
        }else {
            this.addLine(logData);
        }
    }

    addLine(data) {
        let message = {
            level: data.level,
            timestamp: new Date(data.timestamp).toString().substring(0,25),
            message: data.message
        }

        this.lines.push(message);
    }


}

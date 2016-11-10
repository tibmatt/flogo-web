import { Injectable } from '@angular/core';

@Injectable()
export class LogService {
    // TODO define config interface
    public lines: any[];

    constructor() {
        this.lines = [];

        var host = 'localhost';
        var ws = new WebSocket('ws://' + host + ':3011');
        ws.onmessage = (event) => {
            console.info('Received message', new Date());
            try {
                var data = JSON.parse(event.data);
                this.appendLog(data);
            } catch(e) {
                console.error(e);
            }
        };

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

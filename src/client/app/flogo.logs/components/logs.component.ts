import { Component } from '@angular/core';

import { TranslatePipe } from 'ng2-translate/ng2-translate';
import { LogService } from '../../../common/services/log.service';

@Component(
  {
    selector : 'flogo-logs',
    moduleId : module.id,
    directives: [],
    templateUrl : 'logs.tpl.html',
    pipes: [TranslatePipe],
    styleUrls : [ 'logs.component.css' ]
  }
)
export class FlogoLogs {
    messages: string[];

  constructor(public logService: LogService ) {
      /*
      this.messages = [];
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
      */
  }


  ngOnDestroy() {
  }

  appendLog(logData) {
      /*
      let message = {
          level: logData.level,
          timestamp: new Date(logData.timestamp).toString().substring(0,25),
          message: logData.message
      }
      this.messages.push(message);
      */
  }





}

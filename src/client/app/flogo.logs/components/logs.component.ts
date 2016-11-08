import { Component } from '@angular/core';

import { TranslatePipe } from 'ng2-translate/ng2-translate';

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

  constructor( ) {
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
  }


  ngOnDestroy() {
  }

  appendLog(logData) {
      let message = {
          level: logData.level,
          timestamp: new Date(logData.timestamp).toString().substring(0,25),
          message: logData.message
      }

      this.messages.push(message);
    //message = message.replace(/(?:\r\n|\r|\n)/g, '<br />');
    //if(window.ansi_up) {
    //    message = ansi_up.ansi_to_html(message);
    //}
  }





}

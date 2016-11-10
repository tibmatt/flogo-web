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
  }

  ngOnDestroy() {
  }

  appendLog(logData) {
  }





}

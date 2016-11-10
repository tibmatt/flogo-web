import { Component } from '@angular/core';

import { TranslatePipe } from 'ng2-translate/ng2-translate';
import { LogService } from '../../../common/services/log.service';
import { SearchPipe } from './search.component';

@Component(
  {
    selector : 'flogo-logs',
    moduleId : module.id,
    directives: [],
    templateUrl : 'logs.tpl.html',
    pipes: [TranslatePipe, SearchPipe],
    styleUrls : [ 'logs.component.css' ]
  }
)
export class FlogoLogs {
    messages: string[];
    searchValue: string = '';

  constructor(public logService: LogService ) {
  }
  public onKeyUp(event) {
     this.searchValue = event.target.value;
  }
}

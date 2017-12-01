import {Component, Input, Output, EventEmitter} from '@angular/core';
import {LogService} from '@flogo/core/services/log.service';

import 'rxjs/add/operator/map';

@Component(
  {
    selector: 'flogo-logs-content',
    templateUrl: 'content.component.html',
    styleUrls: ['content.component.less']
  }
)
export class LogsContentComponent {
  @Output() onWindowAction: EventEmitter<string>;
  @Input() isExternal = false;
  messages: string[];
  searchValue = '';

  constructor(public logService: LogService) {
    this.onWindowAction = new EventEmitter();
  }

  close() {
    this.onWindowAction.emit('close');
  }

  back() {
  }

  maximize() {
    this.onWindowAction.emit('maximize');
  }

  public onKeyUp(event) {
    this.searchValue = event.target.value;
  }

  public isError(item) {
    const message = item.message || '';
    return (message.indexOf('▶ ERROR') !== -1 || message.indexOf('▶ WARNI') !== -1);
  }

}

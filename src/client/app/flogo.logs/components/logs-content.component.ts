import {Component, ElementRef, Renderer, Output, EventEmitter} from '@angular/core';
import {PostService} from '../../../common/services/post.service';
import { Router, ActivatedRoute, Params as RouteParams } from '@angular/router';
import {LogService} from '../log.service';
import {PUB_EVENTS} from '../messages';

import 'rxjs/add/operator/map';

@Component(
  {
    selector: 'flogo-logs-content',
    moduleId: module.id,
    templateUrl: 'logs-content.tpl.html',
    styleUrls: ['logs-content.component.css']
  }
)
export class FlogoLogsContent {
  @Output() onWindowAction: EventEmitter<string>;
  messages: string[];
  searchValue: string = '';
  isOnSeparatedWindow: boolean;

  constructor(public logService: LogService,
              public router: Router) {
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

  ngOnInit() {
    this.router.events.subscribe((val) => {
      this.isOnSeparatedWindow =  (val.url === '/logs');
    });
  }

  public onKeyUp(event) {
    this.searchValue = event.target.value;
  }

  public isError(item) {
    let message = item.message || '';
    return (message.indexOf('▶ ERROR') !== -1 || message.indexOf('▶ WARNI') !== -1);
  }

}

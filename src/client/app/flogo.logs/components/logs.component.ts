import { Component } from '@angular/core';
import { TranslatePipe } from 'ng2-translate/ng2-translate';
import { PostService } from '../../../common/services/post.service';
import { LogService } from '../../../common/services/log.service';
import { SearchPipe } from './search.component';
import { PUB_EVENTS } from '../messages';

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
    isMaximized: boolean = false;

  constructor(public logService: LogService, public postService: PostService ) {
  }

  public onKeyUp(event) {
     this.searchValue = event.target.value;
  }

  public resizePanel(event,action)   {
      if(event.type == 'mouseleave') {
          if(event.toElement == null) {
              return;
          }
      }
      this.isMaximized = (action === 'grow');
      this.postService.publish(
          _.assign({}, PUB_EVENTS.logResize, {data: {action:action}})
      )
  }


    public isError(item) {
        return (item.message.indexOf('▶ ERROR') !== -1  || item.message.indexOf('▶ WARNI') !== -1);
    }

}

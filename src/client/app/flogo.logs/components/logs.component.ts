import {Component, ElementRef, Renderer} from '@angular/core';
import {PostService} from '../../../common/services/post.service';
import {LogService} from '../../../common/services/log.service';
import {PUB_EVENTS} from '../messages';

const MAXIMIZED_WIDTH = '800px';
@Component(
  {
    selector: 'flogo-logs',
    moduleId: module.id,
    templateUrl: 'logs.tpl.html',
    styleUrls: ['logs.component.css']
  }
)
export class FlogoLogs {
  messages: string[];
  searchValue: string = '';
  isMaximized: boolean = false;

  constructor(public elRef: ElementRef, private renderer: Renderer, public logService: LogService, public postService: PostService) {
  }

  public onKeyUp(event) {
    this.searchValue = event.target.value;
  }

  public resizePanel(event, action) {
    this.isMaximized = (action === 'grow');
    if (this.isMaximized) {
      this.renderer.setElementStyle(this.elRef.nativeElement, 'width', MAXIMIZED_WIDTH);
    } else {
      this.renderer.setElementStyle(this.elRef.nativeElement, 'width', '');
    }

    this.postService.publish(
      _.assign({}, PUB_EVENTS.logResize, {data: {action: action}})
    )
  }


  public isError(item) {
    let message = item.message || '';
    return (message.indexOf('▶ ERROR') !== -1 || message.indexOf('▶ WARNI') !== -1);
  }

}

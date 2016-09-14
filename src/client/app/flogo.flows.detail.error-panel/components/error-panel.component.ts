import {Component, HostBinding} from '@angular/core';
import {PostService} from '../../../common/services/post.service';

@Component({
  selector: 'flogo-flows-detail-error-panel',
  moduleId: module.id,
  templateUrl: 'error-panel.tpl.html',
  styleUrls: ['error-panel.component.css']
})


export class FlogoFlowsDetailErrorPanel {
  @HostBinding('class.is-open')
  isOpen: boolean = false;
  @HostBinding('class.is-opening')
  isOpening: boolean = false;
  @HostBinding('class.is-closing')
  isClosing: boolean = false;

  constructor(private _postService: PostService){
    this.initSubscribe();
  }

  public toggle() {
    if(this.isOpen) {
      this.isOpening = false;
      this.isClosing = true;
    } else {
      this.isClosing = true;
      this.isOpening = false;
    }

    // let the animation setup take effect
    setTimeout(() => {
      this.isOpening = false;
      this.isClosing = false;
      this.isOpen = !this.isOpen;
    }, 50);
  }

  private initSubscribe(){
  }
}

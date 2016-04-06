import { Component, ViewChild, OnDestroy } from 'angular2/core';
import { Control, FORM_DIRECTIVES } from 'angular2/common';
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Observable} from 'rxjs/Rx';

import { PostService } from '../../../common/services/post.service';

import { PUB_EVENTS, SUB_EVENTS } from '../messages';

interface TransformData {
  previous: any[],
  current: {},
  mappings: string,
  next: {}
}

@Component({
  selector: 'flogo-transform',
  directives: [MODAL_DIRECTIVES, FORM_DIRECTIVES],
  moduleId: module.id,
  templateUrl: 'transform.tpl.html',
})
export class TransformComponent implements OnDestroy {

  @ViewChild('transformModal')
  modal:ModalComponent;

  private _subscriptions:any[];
  private data:TransformData = {
    previousTiles: [],
    tile: null,
    mappings: ''
  };

  ///
  codeControl = new Control();
  result:{} = {};

  constructor(private _postService:PostService) {
    this.initSubscriptions();

    this.codeControl.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(this.onCodeChange.bind(this));

  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onCodeChange(newCode:string) {
  }

  saveTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.saveTransform, {
      data: {
        tile: this.data.current,
        result: this.data.mappings
      }
    }));
    this.close();
  }

  deleteTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.deleteTransform, {
      data: {
        tile: this.data.tile,
        result: this.data.mappings
      }
    }));
    this.close();
  }

  private initSubscriptions() {

    let subHandlers = [
      _.assign({}, SUB_EVENTS.selectActivity, {callback: this.onTransformSelected.bind(this)})
    ];

    this._subscriptions = subHandlers.map(handler => this._postService.subscribe(handler));

  }

  private cancelSubscriptions() {
    if (_.isEmpty(this._subscriptions)) {
      return true;
    }
    this._subscriptions.forEach(this._postService.unsubscribe);
    return true;
  }

  private onTransformSelected(data:any, envelope:any) {
    // 1. set/restart data
    // 2. open modal
    this.data = Object.assign({mappings: ''}, data);
    this.modal.open();
  }

  private close() {
    this.modal.close();
  }

}

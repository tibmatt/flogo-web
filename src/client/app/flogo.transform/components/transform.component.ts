import { Component, ViewChild, OnDestroy } from 'angular2/core';
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import { PostService } from '../../../common/services/post.service';

import { PUB_EVENTS, SUB_EVENTS } from '../messages';
import { MapEditorComponent } from "./map-editor.component";

interface TransformData {
  previousTiles: any[],
  tile: {},
  mappings: any
}

@Component({
  selector: 'flogo-transform',
  directives: [MODAL_DIRECTIVES, MapEditorComponent],
  moduleId: module.id,
  templateUrl: 'transform.tpl.html',
})
export class TransformComponent implements OnDestroy {

  @ViewChild('transformModal')
  modal:ModalComponent;

  isValid : boolean = true;
  isDirty : boolean = false;

  private _subscriptions:any[];
  private data:TransformData = {
    previousTiles: [],
    tile: null,
    mappings: null
  };

  constructor(private _postService:PostService) {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onMappingsChange(change:any) {
    this.isValid = change.isValid;
    this.isDirty = change.isDirty;

    if(change.isValid) {
      this.data.mappings = change.mappings;
    }

  }

  saveTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.saveTransform, {
      data: {
        tile: this.data.tile,
        inputMappings: this.data.mappings
      }
    }));
    this.close();
  }

  deleteTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.deleteTransform, {
      data: {
        tile: this.data.tile
      }
    }));
    this.close();
  }

  cancel() {
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
    this.data = {
      previousTiles: data.previousTiles,
      tile: data.tile,
      mappings: data.tile.inputMappings ? _.cloneDeep(data.tile.inputMappings) : []
    };

    setTimeout(() => this.modal.open(), 0);
  }

  private close() {
    this.modal.close();
  }

}

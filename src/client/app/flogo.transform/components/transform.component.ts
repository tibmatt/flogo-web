import { Component, ViewChild, OnDestroy } from 'angular2/core';

import { PostService } from '../../../common/services/post.service';

import { FLOGO_TASK_ATTRIBUTE_TYPE as TYPES } from '../../../common/constants';
import { PUB_EVENTS, SUB_EVENTS } from '../messages';
import { MapEditorComponent } from "./map-editor.component";
import { ErrorDisplayComponent } from "./error-display.component";

interface TransformData {
  precedingTilesOutputs: any[],
  tile: any,
  tileInputInfo: any,
  mappings: any
}

@Component({
  selector: 'flogo-transform',
  directives: [MapEditorComponent, ErrorDisplayComponent],
  moduleId: module.id,
  styleUrls: ['transform.component.css'],
  templateUrl: 'transform.tpl.html',
})
export class TransformComponent implements OnDestroy {

  isValid:boolean;
  isDirty:boolean;

  errors:any;

  // two variables control the display of the modal to support animation when opening and closing
  active:boolean = false; // controls the rendering of the content of the modal
  out:boolean = false; // controls the in/out transition of the modal

  private _subscriptions:any[];
  private data:TransformData = {
    precedingTilesOutputs: [],
    tile: null,
    tileInputInfo: null,
    mappings: null
  };

  constructor(private _postService:PostService) {
    this.initSubscriptions();
    this.resetState();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onMappingsChange(change:any) {
    this.isValid = change.isValid;
    this.isDirty = change.isDirty;

    if (change.isValid) {
      this.data.mappings = change.value;
      this.errors = null;
    } else {
      this.errors = change.errors;
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
      precedingTilesOutputs: this.extractPrecedingTilesOutputInfo(data.previousTiles),
      tile: data.tile,
      tileInputInfo: this.extractTileInputInfo(data.tile || {}),
      mappings: data.tile.inputMappings ? _.cloneDeep(data.tile.inputMappings) : []
    };
    this.resetState();

    this.open();

  }

  private extractPrecedingTilesOutputInfo(precedingTiles:any[]) {
    return _.chain(precedingTiles || [])
      .filter((tile:any) => tile.attributes && tile.attributes.outputs && tile.attributes.outputs.length > 0)
      .map((tile:any) => {
        let outputs = tile.attributes.outputs.map(this.mapInOutObjectDisplay);
        return [tile.id, outputs];
      })
      .fromPairs()
      .value();
  }

  private extractTileInputInfo(tile:any) {
    return {
      id: tile.id,
      inputs: tile.attributes && tile.attributes.inputs ?
        tile.attributes.inputs.map(this.mapInOutObjectDisplay)
        : []
    }
  }

  private mapInOutObjectDisplay(inputOutput:{name:string, type:TYPES}) {
    return {
      name: inputOutput.name,
      type: TYPES[inputOutput.type].toLowerCase()
    };
  }

  private resetState() {
    this.isValid = true;
    this.isDirty = false;
    this.errors = null;
  }

  private open() {
    this.out = false;
    setTimeout(() => this.active = true, 0);
  }

  private close() {
    this.out = true;
    setTimeout(() => this.active = this.out = false, 400);
  }

}

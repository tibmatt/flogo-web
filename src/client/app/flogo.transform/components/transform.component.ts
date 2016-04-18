import { Component, ViewChild, OnDestroy } from 'angular2/core';

import { PostService } from '../../../common/services/post.service';

import { FLOGO_TASK_ATTRIBUTE_TYPE as TYPES } from '../../../common/constants';
import { REGEX_INPUT_VALUE_INTERNAL, REGEX_INPUT_VALUE_EXTERNAL } from '../constants';
import { PUB_EVENTS, SUB_EVENTS } from '../messages';
import { MapEditorComponent } from './map-editor.component';
import { ErrorDisplayComponent } from './error-display.component';

import { sluggifyTaskName as convertTaskName } from '../../../common/utils';

interface TransformData {
  result: any,
  precedingTiles: any[],
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
    result: null,
    precedingTiles: [],
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
      this.data.result = change.value;
      this.errors = null;
    } else {
      this.errors = change.errors;
    }

  }

  saveTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.saveTransform, {
      data: {
        tile: this.data.tile,
        inputMappings: this.transformMappingsToExternalFormat(this.data.result)
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
      result: null,
      precedingTiles: data.previousTiles,
      precedingTilesOutputs: this.extractPrecedingTilesOutputs(data.previousTiles),
      tile: data.tile,
      tileInputInfo: this.extractTileInputInfo(data.tile || {}),
      mappings: data.tile.inputMappings ? _.cloneDeep(data.tile.inputMappings) : []
    };
    this.data.mappings = this.transformMappingsToInternalFormat(this.data.mappings);

    this.resetState();

    this.open();

  }

  private extractPrecedingTilesOutputs(precedingTiles:any[]) {
    return _.chain(precedingTiles || [])
      .filter((tile:any) => tile.attributes && tile.attributes.outputs && tile.attributes.outputs.length > 0)
      .map((tile:any) => {
        let name = convertTaskName(tile.name);
        let outputs = tile.attributes.outputs.map(this.mapInOutObjectDisplay);
        return [name, outputs];
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

  private transformMappingsToExternalFormat(mappings: any[]) {
    let tileMap = {};
    _.forEach(this.data.precedingTiles, tile => {
      tileMap[convertTaskName(tile.name)] = tile.id;
    });

    let re = REGEX_INPUT_VALUE_INTERNAL;

    mappings.forEach(mapping => {
      let matches = re.exec(mapping.value);
      if(!matches) {
        return; // ignoring it
      }

      let taskId = tileMap[matches[2]];
      let property = matches[3];
      let rest = matches[4] || '';
      mapping.value = `[T${taskId}.${property}]${rest}`;
    });

    return mappings;

  }

  private transformMappingsToInternalFormat(mappings: any[]) {
    let tileMap = {};
    _.forEach(this.data.precedingTiles, tile => {
      tileMap[tile.id] = convertTaskName(tile.name);
    });

    let re = REGEX_INPUT_VALUE_EXTERNAL;

    mappings.forEach(mapping => {
      let matches = re.exec(mapping.value);
      if(!matches) {
        return; // ignoring it
      }

      let taskName = tileMap[matches[1]];
      let property = matches[2];
      let rest = matches[3] || '';
      mapping.value = `${taskName}.${property}${rest}`;
    });

    return mappings;

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

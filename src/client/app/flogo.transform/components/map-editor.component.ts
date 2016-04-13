import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from 'angular2/core';
import { FORM_DIRECTIVES, Control, Validator, Validators } from 'angular2/common';
import { Observable } from 'rxjs/Rx';

import { TileInOutInfo } from '../models/tile-in-out-info.model';
import { jsonValidator, mappingsValidatorFactory } from '../validators/validators';

@Component({
  selector: 'flogo-transform-map-editor',
  directives: [FORM_DIRECTIVES],
  moduleId: module.id,
  templateUrl: 'map-editor.tpl.html'
})
export class MapEditorComponent implements OnChanges, OnInit {

  @Output() mappingChange:EventEmitter<any>;
  @Input() mappings:any = '';

  @Input() tile:any = null;
  @Input() precedingTiles:any[] = [];

  editor:Control;

  private tileInfo:TileInOutInfo = {
    attributes: [],
    precedingOutputs: []
  };

  constructor() {
    let mappingsValidator = mappingsValidatorFactory(this.tileInfo);
    this.editor = new Control('', Validators.compose([Validators.required, jsonValidator, mappingsValidator]));
    this.mappingChange = new EventEmitter();
  }

  ngOnInit() {
    this
      .editor
      .valueChanges
      .debounceTime(300)
      .distinctUntilChanged()
      .map((rawVal:string) => {
        return {
          isValid: this.editor.valid,
          isDirty: this.editor.dirty,
          errors: this.editor.errors,
          value: this.editor.valid ? JSON.parse(rawVal) : null
        };
      })
      .distinctUntilChanged((prev:any, next:any) => _.isEqual(prev, next))
      .do((val) => {
        console.group('emitted val');
        console.log(val);
        console.groupEnd();
      })
      .subscribe(val => this.mappingChange.emit(val));
  }

  ngOnChanges(changes:any) {
    if (changes.mappings) {
      this.onMappingsChange(changes.mappings);
    }

    if (changes.tile && this.tile) {
      this.tileInfo.attributes = this.extractAttributes(this.tile);
    }

    if (changes.precedingTiles && this.precedingTiles) {
      this.tileInfo.precedingOutputs = this.extractPrecedingOutputs(this.precedingTiles);
    }

  }

  private onMappingsChange(mappingsChange:any) {
    let nextValue = mappingsChange.currentValue;
    let currentEditorValue:any = null;
    try {
      currentEditorValue = JSON.parse(this.editor.value);
    } catch (e) { // current val is just not valid json
    }

    if (!_.isEqual(mappingsChange.previousValue, nextValue) && !_.isEqual(nextValue, currentEditorValue)) {
      let stringified = JSON.stringify(nextValue || [], null, 2);
      this.editor.updateValue(stringified, {onlySelf: true, emitEvent: false});
    }
  }

  private extractAttributes(tile:any) {
    return tile && tile.attributes && tile.attributes.inputs ? tile.attributes.inputs.map((attr:any) => attr.name) : [];
  }

  private extractPrecedingOutputs(precedingTiles:any[]) {
    return precedingTiles ? precedingTiles.reduce((outputs:string[], tile:any) => {

      let tileOutputs : string[] = [];

      if (tile.attributes && tile.attributes.outputs) {
        tileOutputs = tileOutputs.concat(tile.attributes.outputs.map((output:any) => output.mapTo));
      }

      if (tile.outputMappings) {
        tileOutputs = tileOutputs.concat(tile.outputMappings.map((mapping:any) => mapping.name));
      }

      return outputs.concat(tileOutputs);
    }, []) : [];
  }

}

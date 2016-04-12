import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from 'angular2/core';
import { FORM_DIRECTIVES, Control } from 'angular2/common';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'flogo-transform-map-editor',
  directives: [FORM_DIRECTIVES],
  moduleId: module.id,
  templateUrl: 'map-editor.tpl.html'
})
export class MapEditorComponent implements OnChanges, OnInit {

  @Output() mappingChange:EventEmitter<any>;
  @Input() format:boolean = false;
  @Input() mappings:any = '';

  editor:Control = new Control();

  constructor() {
    this.editor = new Control();
    this.mappingChange = new EventEmitter();

  }

  ngOnInit() {
    this
      .editor
      .valueChanges
      .debounceTime(300)
      .distinctUntilChanged()
      .map((code:string) => {
        try {
          return JSON.parse(code);
        } catch (e) {
          return {type: 'error', message: 'invalid json'};
        }
      })
      .distinctUntilChanged((prev:any, next:any) => _.isEqual(prev, next))
      .map(val => {
        return {
          mappings: val,
          isValid: !(val.type && val.type == 'error'),
          isDirty: this.editor.dirty
        };
      })
      .do((val) => {
        console.group('emitted val');
        console.log(val);
        console.groupEnd();
      })
      .subscribe(val => this.mappingChange.emit(val));
  }

  ngOnChanges(changes) {
    let stringified:string = '';
    if (changes.mappings) {
      let mappings = changes.mappings;
      let nextValue = mappings.currentValue;
      if (!_.isEqual(mappings.previousValue, nextValue) && !_.isEqual(nextValue, JSON.parse(this.editor.value))) {
        stringified = JSON.stringify(nextValue || [], null, 2);
        this.editor.updateValue(stringified, {onlySelf: true, emitEvent: false});
      }
    }
  }

}

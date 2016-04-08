import { Component, Input, Output, EventEmitter, OnChanges } from 'angular2/core';
import { FORM_DIRECTIVES, Control } from 'angular2/common';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'flogo-transform-map-editor',
  directives: [FORM_DIRECTIVES],
  moduleId: module.id,
  templateUrl: 'map-editor.tpl.html'
})
export class MapEditorComponent implements OnChanges {

  @Output() mappingChange:EventEmitter<any>;
  @Input() mappings:any = '';
  private prevVal:string;

  editor:Control = new Control();

  constructor() {
    this.editor = new Control();
    this.mappingChange = new EventEmitter();

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
      .scan((acc:any, next:any) => {
        return {prev: acc.next, next}
      }, {prev: null, next: null})
      .filter(acc => !_.isEqual(acc.prev, acc.next))
      .map(acc => acc.next)
      .subscribe(val => this.mappingChange.emit(val));

  }

  ngOnChanges(changes) {
    let stringified:string = '';
    if (changes.mappings) {
      try {
        let value = changes.mappings.currentValue ? changes.mappings.currentValue : [];
        stringified = JSON.stringify(value, null, 2);
      } catch (e) {
      }

      if (this.prevVal != stringified) {
        this.prevVal = stringified;
        this.editor.updateValue(stringified, {onlySelf: true, emitEvent: false})
      }


    }
  }

}

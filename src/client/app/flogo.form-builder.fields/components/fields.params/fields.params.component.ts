import {Component, SimpleChange} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';

@Component({
  selector: 'flogo-form-builder-fields-params',
  styleUrls: ['fields.params.css', '../fields.base/fields.base.css'],
  moduleId: module.id,
  templateUrl: 'fields.params.tpl.html',
  directives: [ROUTER_DIRECTIVES],
  inputs:['_info:info','_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsParams  extends FlogoFormBuilderFieldsBase {
  _info:any;
  _fieldObserver:any;
  _value:any;

  constructor() {
  }

  ngOnInit() {
    if(this._info.value) {
      this._value= this.clearQuotes(JSON.stringify(this._info.value));
    }
  }

}

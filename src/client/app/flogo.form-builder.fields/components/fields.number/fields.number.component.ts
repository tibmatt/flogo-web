import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';

@Component({
  selector: 'flogo-form-builder-fields-number',
  styleUrls: ['fields.number.css','../fields.base/fields.base.css'],
  moduleId: module.id,
  templateUrl: 'fields.number.tpl.html',
  directives: [ROUTER_DIRECTIVES],
  inputs:['_info:info','_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsNumber extends FlogoFormBuilderFieldsBase{
  _info:any;
  _fieldObserver:any

  constructor() {
  }

}

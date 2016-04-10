import {Component, SimpleChange} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';

@Component({
  selector: 'flogo-form-builder-fields-textarea',
  styleUrls: ['fields.textarea.css'],
  moduleId: module.id,
  templateUrl: 'fields.textarea.tpl.html',
  directives: [ROUTER_DIRECTIVES],
  inputs:['info','_observer:observer']
})

export class FlogoFormBuilderFieldsTextArea  extends FlogoFormBuilderFieldsBase {
  info:any;
  _observer:any;

  constructor() {
  }

}

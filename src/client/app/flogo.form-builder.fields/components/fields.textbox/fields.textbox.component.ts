import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';

@Component({
  selector: 'flogo-form-builder-fields-textbox',
  styleUrls: ['fields.textbox.css'],
  moduleId: module.id,
  templateUrl: 'fields.textbox.tpl.html',
  directives: [ROUTER_DIRECTIVES],
  inputs:['info','_observer:observer']
})

export class FlogoFormBuilderFieldsTextBox  extends FlogoFormBuilderFieldsBase {
  info:any;
  _observer:any;

  constructor() {
  }

  ngOnInit() {
  }

}

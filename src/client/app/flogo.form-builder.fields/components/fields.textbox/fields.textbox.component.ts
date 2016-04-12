import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';

@Component({
  selector: 'flogo-form-builder-fields-textbox',
  styleUrls: ['fields.textbox.css','../fields.base/fields.base.css'],
  moduleId: module.id,
  templateUrl: 'fields.textbox.tpl.html',
  directives: [ROUTER_DIRECTIVES],
  inputs:['_info:info','_observer:observer','_observerError:observerError']
})

export class FlogoFormBuilderFieldsTextBox  extends FlogoFormBuilderFieldsBase {
  _info:any;
  _observer:any;
  _observerError:any;

  constructor() {
  }

  ngOnInit() {
  }

}

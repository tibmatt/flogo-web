import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';

@Component({
  selector: 'flogo-form-builder-fields-listbox',
  styleUrls: ['fields.listbox.css','../fields.base/fields.base.css'],
  moduleId: module.id,
  templateUrl: 'fields.listbox.tpl.html',
  directives: [ROUTER_DIRECTIVES],
  inputs:['_info:info','_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsListBox  extends FlogoFormBuilderFieldsBase {
  _info:any;
  _fieldObserver:any;
  options:any[] = [];


  constructor() {
    super();
  }

  ngOnInit() {
    this.options =  [""].concat(this._info.allowed);
  }

  onSelectOption(option:string) {
    this._info.value = option;
  }

}

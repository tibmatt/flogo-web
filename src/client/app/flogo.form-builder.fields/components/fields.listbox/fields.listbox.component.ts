import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';
import {DEFAULT_VALUES_OF_TYPES as DEFAULT_VALUES} from '../../../../common/constants'

const EMPTY_OPTION = '<empty>';

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
    this.options =  [EMPTY_OPTION].concat(this._info.allowed);
  }

  onChangeField(option:string) {
    if (option == EMPTY_OPTION) {
      option = DEFAULT_VALUES[this._info.type];
    }
    this._info.value = option;
    this.publishNextChange();
  }

}

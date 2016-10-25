import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';
import {DEFAULT_VALUES_OF_TYPES as DEFAULT_VALUES} from '../../../../common/constants'
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';

const EMPTY_OPTION = '<empty>';

@Component({
  selector: 'flogo-form-builder-fields-listbox',
  styleUrls: ['fields.listbox.css','../fields.base/fields.base.css'],
  moduleId: module.id,
  templateUrl: 'fields.listbox.tpl.html',
  directives: [ROUTER_DIRECTIVES],
  inputs:['_info:info','_fieldObserver:fieldObserver'],
  pipes: [TranslatePipe]
})

export class FlogoFormBuilderFieldsListBox  extends FlogoFormBuilderFieldsBase {
  _info:any;
  _fieldObserver:any;
  options:any[] = [];


  constructor(public translate: TranslateService) {
    super(translate);
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

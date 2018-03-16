import { Component, OnInit } from '@angular/core';
import { LanguageService, ValueType } from '@flogo/core';

import { FlogoFormBuilderFieldsBaseComponent } from '../shared/base.component';

const EMPTY_OPTION = '<empty>';

@Component({
  selector: 'flogo-flow-form-builder-fields-listbox',
  styleUrls: ['listbox.component.less', '../shared/base.component.less'],
  templateUrl: 'listbox.component.html',
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable-next-line:use-input-property-decorator */
  inputs: ['_info:info', '_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsListBoxComponent extends FlogoFormBuilderFieldsBaseComponent implements OnInit {
  _info: any;
  _fieldObserver: any;
  options: any[] = [];

  constructor(translate: LanguageService) {
    super(translate);
  }

  ngOnInit() {
    this.options = [EMPTY_OPTION].concat(this._info.allowed);
  }

  onChangeField(option: string) {
    if (option === EMPTY_OPTION) {
      option = ValueType.defaultValueForType.get(this._info.type);
    }
    this._info.value = option;
    this.publishNextChange();
  }

}

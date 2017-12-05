import { Component, OnInit } from '@angular/core';
import { FlogoFormBuilderFieldsBaseComponent } from '../shared/base.component';
import { DEFAULT_VALUES_OF_TYPES as DEFAULT_VALUES } from '@flogo/core/constants';
import { LanguageService } from '@flogo/core';

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
      option = DEFAULT_VALUES[this._info.type];
    }
    this._info.value = option;
    this.publishNextChange();
  }

}

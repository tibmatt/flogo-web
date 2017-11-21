import { Component, OnInit } from '@angular/core';
import { FlogoFormBuilderFieldsBaseComponent } from '../fields.base/fields.base.component';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'flogo-form-builder-fields-object',
  styleUrls: ['fields.object.less', '../fields.base/fields.base.less'],
  templateUrl: 'fields.object.tpl.html',
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable-next-line:use-input-property-decorator */
  inputs: ['_info:info', '_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsObjectComponent extends FlogoFormBuilderFieldsBaseComponent implements OnInit {
  _info: any;
  _fieldObserver: any;
  _value: string;


  constructor(public translate: TranslateService) {
    super(translate);
  }


  ngOnInit() {
    // primitive values could be assigned directly instead of using JSON.stringify, for avoiding the extra " marks
    // also ensure the value is in string format
    // And object field can store xml, json, different formats
    // first we try to map to string
    if (_.isNumber(this._info.value) || _.isString(this._info.value) || _.isBoolean(this._info.value)) {
      this._value = '' + this._info.value;
      return;
    }

    if (this._info.value) {
      try {
        this._value = '' + JSON.stringify(this._info.value);
      } catch (err) {
      }

    }

  }

}

import { Component, OnInit } from '@angular/core';
import { FlogoFormBuilderFieldsBaseComponent } from '../fields.base/fields.base.component';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'flogo-form-builder-fields-textarea',
  styleUrls: ['fields.textarea.less', '../fields.base/fields.base.less'],
  templateUrl: 'fields.textarea.tpl.html',
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable-next-line:use-input-property-decorator */
  inputs: ['_info:info', '_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsTextAreaComponent extends FlogoFormBuilderFieldsBaseComponent implements OnInit {
  _info: any;
  _fieldObserver: any;
  _value: any;

  constructor(public translate: TranslateService) {
    super(translate);
  }

  onChangeField(event: any) {
    if (event.key === 'Escape') {
      this._info = Object.assign({}, this.originalInfo);
      this._value = this._info.value;
      this.publishNextChange();
      return;
    }
    this._info.value = this.getValidatedValue(event.target.value, true, true);
    this.publishNextChange();
  }

  ngOnInit() {
    if (this._info.value && (this._info.isTrigger || (this._info.isTask && this._info.direction === 'input'))) {
      this._value = this.getValidatedValue(this._info.value, false, false);
    }
  }

  getValidatedValue(value: string, toJSON: boolean, notify: boolean = false): string {
    let validatedValue: string;
    let hasError = false;

    try {
      if (value) {
        if (toJSON) {
          validatedValue = JSON.parse(value);
        } else {
          if (_.isNumber(this._info.value) || _.isString(this._info.value) || _.isBoolean(this._info.value)) {
            validatedValue = '' + this._info.value;
            hasError = true;
          } else {
            validatedValue = JSON.stringify(value);
          }
        }
      } else {
        validatedValue = '';
      }
    } catch (err) {
      validatedValue = '' + value;
      hasError = true;
    }

    this._hasError = hasError;
    if (hasError) {
      this._errorMessage = this.translate.instant('FIELDS-TEXTAREA:INVALID-JSON', { value: this._info.title });
      if (notify) {
        this._fieldObserver.next(this._getMessage('validation', { status: 'error', field: this._info.name }));
      }
    } else {
      this._errorMessage = '';
      if (notify) {
        this._fieldObserver.next(this._getMessage('validation', { status: 'ok', field: this._info.name }));
      }
    }
    return validatedValue;
  }

}

import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  template: '',
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable-next-line:use-input-property-decorator */
  inputs: ['_info:info', '_fieldObserver:fieldObserver']
})
export class FlogoFormBuilderFieldsBaseComponent {
  _info: any;
  _hasError = false;
  _errorMessage: string;
  _fieldObserver: any;
  originalInfo: any;

  constructor(public translate: TranslateService) {
    this._hasError = false;
  }

  onChangeField(event: any) {
    this._info.value = event.target.value;
    this.publishNextChange();
  }

  _getMessage(message: string, properties: any) {
    return _.assign({}, { message: message }, { payload: properties });
  }

  publishNextChange() {
    this._fieldObserver.next(this._getMessage('change-field', this._info));
  }

  isReadOnly() {
    if (this._info.isTrigger) {
      return false;
    }

    return this._info.direction === 'output';
  }

  onValidate(event: any) {
    const value = event.target.value || '';

    if (this._info.required) {
      if (!value.trim()) {
        this._errorMessage = this.translate.instant('FIELDS-BASE:TITLE-REQUIRED', { value: this._info.title });
        this._hasError = true;
        this._fieldObserver.next(this._getMessage('validation', { status: 'error', field: this._info.name }));
        return;
        // todo
      } else {
        this._hasError = false;
      }
      this._fieldObserver.next(this._getMessage('validation', { status: 'ok', field: this._info.name }));
    }

    if (this._info.validation) {
      if (!this._validate(value)) {
        this._hasError = true;
        this._errorMessage = this._info.validationMessage;
        this._fieldObserver.next(this._getMessage('validation', { status: 'error', field: this._info.name }));
      } else {
        this._hasError = false;
        this._fieldObserver.next(this._getMessage('validation', { status: 'ok', field: this._info.name }));

      }
    }
  }

  _validate(value: string) {
    const re = new RegExp(this._info.validation);
    return re.test(value);
  }

  onFocus(event) {
    this.originalInfo = Object.assign({}, this._info);
  }


  onKeyUp(event) {
    if (event.key === 'Escape') {
      this._info = Object.assign({}, this.originalInfo);
      if (this['_value']) {
        this['_value'] = this._info.value;
      }
      this.publishNextChange();
      return;
    }
    this._info.value = event.target.value;
    this.publishNextChange();

    this.onValidate(event);
  }

  onBlur(event) {
    this.publishNextChange();
  }


}

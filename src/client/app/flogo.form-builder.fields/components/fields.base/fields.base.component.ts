import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../../common/constants';
import {Component} from 'angular2/core';

@Component({
  inputs:['_info:info','_observer:observer','_observerError:observerError']
})
export class FlogoFormBuilderFieldsBase{
  _info:any;
  _observer: any;
  _observerError: any;
  _hasError:boolean = false;
  _errorMessage:string;

  constructor() {
    this._hasError = false;
  }

  onChangeField(event) {
    this._info.value =event.target.value;
    this._observer.next(this._info);
  }

  onValidate(event) {
    var value = event.target.value || '';

    if(this._info.required) {
      if(!value.trim()) {
        this._errorMessage = this._info.title + ' is required';
        this._hasError = true;
        this._observerError.next({name:this._info.name, status:'error'});
        return;
      }else
      this._hasError = false;
      this._observerError.next({name:this._info.name, status:'ok'});
    }

    if(this._info.validation) {
        if(!this._validate(value)) {
          this._hasError = true;
          this._errorMessage = this._info.validationMessage;
          this._observerError.next({name:this._info.name, status:'error'});
        }else {
          this._hasError = false;
          this._observerError.next({name:this._info.name, status:'ok'});
        }
    }
  }

  _validate(value:string) {
    var re = new RegExp(this._info.validation);

    return re.test(value);
  }


}

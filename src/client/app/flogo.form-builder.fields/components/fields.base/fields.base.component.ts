import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../../common/constants';
import {Component} from 'angular2/core';

@Component({
  inputs:['_info:info','_observer:observer']
})
export class FlogoFormBuilderFieldsBase{
  _info:any;
  _observer: any;

  onChangeField(event) {
    this._info.value =event.target.value;
    this._observer.next(this._info);
  }


}

import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../../common/constants';
import {Component} from 'angular2/core';

@Component({
  inputs:['info:info','_observer:observer']
})
export class FlogoFormBuilderFieldsBase{
  info:any;
  _observer: any;
  //schema: any;
  //value: any;

  onChangeField(event) {
    this.info.value =event.target.value;
    this._observer.next(this.info);
  }


}

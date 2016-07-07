import {Injectable} from '@angular/core';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../common/constants';

@Injectable()
export class FlogoFormBuilderCommon {


  getStructureFromAttributes(structure:string, attributes:any) {
    var returnValue =  _.get(attributes, structure, []);

    return this._getArray(returnValue);
  }

  _getArray(obj:any) {

    if(!Array.isArray(obj)) {
      return [];
    }

    return obj;
  }

  _mapTypeToConstant(type:string|FLOGO_TASK_ATTRIBUTE_TYPE) {
    switch(type) {
      case 'string':
      case FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
        return FLOGO_TASK_ATTRIBUTE_TYPE.STRING;

      case 'number':
      case FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
        return FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER;

      case FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
      case 'boolean':
        return FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN;

      case FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
      case 'object':
        return FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT;

      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
      case 'map':
      case 'params':
        return FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS;

      default:
        return FLOGO_TASK_ATTRIBUTE_TYPE.STRING;
    }
  }

  getControlByType(type:string) {

    switch(this._mapTypeToConstant(type)) {

      case  FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
        return {control: 'FieldTextBox'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
        return {control:'FieldNumber'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
        return {control:'FieldRadio'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
      case FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
        return {control:'FieldTextArea'};

      default:
        return {control:'TextBox'};
    }

  }

}

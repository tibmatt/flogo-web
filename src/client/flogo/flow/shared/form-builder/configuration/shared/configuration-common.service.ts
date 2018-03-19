import {Injectable} from '@angular/core';
import { ValueTypes } from '@flogo/core/constants';

@Injectable()
export class FlogoConfigurationCommonService {
  directions = {
    output: 'output',
    input: 'input'
  };

  getParameterDirections() {
    return this.directions;
  }

  getStructureFromAttributes(structure: string, attributes: any) {
    const returnValue =  _.get(attributes, structure, []);

    return this._getArray(returnValue);
  }

  _getArray(obj: any) {
    if (!Array.isArray(obj)) {
      return [];
    }

    return obj;
  }

  getControlByType(item: any, paramDirection?: string) {
    let control = '';
    const typeAsConstant = item.type as ValueTypes.ValueType;

    switch (typeAsConstant) {
      case  ValueTypes.STRING:
        control =  'FieldTextBox';
        break;

      case ValueTypes.DOUBLE:
      case ValueTypes.INTEGER:
        control = 'FieldNumber';
        break;

      case ValueTypes.BOOLEAN:
        control = 'FieldRadio';
        break;

      case ValueTypes.PARAMS:
        control = 'FieldTextArea';
        break;

      case ValueTypes.ANY:
      case ValueTypes.OBJECT:
      case ValueTypes.COMPLEX_OBJECT:
        control = 'FieldObject';
        break;

      default:
        control = 'FieldTextBox';
        break;
    }

    if (paramDirection === this.directions.output && item.type === ValueTypes.STRING) {
      control = 'FieldObject';
    }

    if (item.allowed) { control = 'FieldListBox'; }

    return {control};

  }

}

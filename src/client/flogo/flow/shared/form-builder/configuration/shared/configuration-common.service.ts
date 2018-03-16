import {Injectable} from '@angular/core';
import { ValueType } from '@flogo/core/constants';

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
    const typeAsConstant = item.type as ValueType;

    switch (typeAsConstant) {
      case  ValueType.String:
        control =  'FieldTextBox';
        break;

      case ValueType.Number:
      case ValueType.Integer:
        control = 'FieldNumber';
        break;

      case ValueType.Boolean:
        control = 'FieldRadio';
        break;

      case ValueType.Params:
        control = 'FieldTextArea';
        break;

      case ValueType.Any:
      case ValueType.Object:
      case ValueType.ComplexObject:
        control = 'FieldObject';
        break;

      default:
        control = 'FieldTextBox';
        break;
    }

    if (paramDirection === this.directions.output && item.type === ValueType.String) {
      control = 'FieldObject';
    }

    if (item.allowed) { control = 'FieldListBox'; }

    return {control};

  }

}

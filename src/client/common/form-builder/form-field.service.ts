import { Injectable } from '@angular/core';
import { FLOGO_TASK_ATTRIBUTE_TYPE } from '../constants';
import { Textbox } from './textbox/textbox';
import { BaseField } from './field-base';
import { FieldAttribute } from './field-attribute';
import { NumberType } from './number/number';
import { Textarea } from './textarea/textarea';
import { Radio } from './radio/radio';
import { ObjectType } from './object/objectType';

@Injectable()
export class FormFieldService {

  mapFieldsToControlType(field: FieldAttribute): BaseField<any> {
    switch (field.type) {
      case 'string':
      case FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
        return new Textbox({
          name: field.name,
          type: field.type,
          value: field.value
        });

      case 'number':
      case 'int':
      case 'integer':
      case FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
      case FLOGO_TASK_ATTRIBUTE_TYPE.INT:
      case FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER:
        return new NumberType({
          name: field.name,
          type: field.type,
          value: field.value
        });

      case 'map':
      case 'params':
      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
        return new Textarea({
          name: field.name,
          type: field.type,
          value: field.value
        });

      case 'boolean':
      case FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
        return new Radio({
          name: field.name,
          type: field.type,
          value: field.value
        });

      case 'object':
      case 'any':
      case 'complex_object':
      case FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
      case FLOGO_TASK_ATTRIBUTE_TYPE.ANY:
      case FLOGO_TASK_ATTRIBUTE_TYPE.COMPLEX_OBJECT:
        return new ObjectType({
          name: field.name,
          type: field.type,
          value: field.value
        });

      default:
        return new Textbox({
          name: field.name,
          type: field.type,
          value: field.value
        });
    }
  }
}

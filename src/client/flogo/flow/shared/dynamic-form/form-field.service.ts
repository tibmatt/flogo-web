import { Injectable } from '@angular/core';
import { ValueTypes } from '@flogo/core';
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
      case ValueTypes.STRING:
        return new Textbox({
          name: field.name,
          type: field.type,
          value: field.value
        });
      case ValueTypes.NUMBER:
      case ValueTypes.INTEGER:
        return new NumberType({
          name: field.name,
          type: field.type,
          value: field.value
        });
      case ValueTypes.PARAMS:
        return new Textarea({
          name: field.name,
          type: field.type,
          value: field.value
        });
      case ValueTypes.BOOLEAN:
        return new Radio({
          name: field.name,
          type: field.type,
          value: field.value
        });
      case ValueTypes.OBJECT:
      case ValueTypes.ANY:
      case ValueTypes.COMPLEX_OBJECT:
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

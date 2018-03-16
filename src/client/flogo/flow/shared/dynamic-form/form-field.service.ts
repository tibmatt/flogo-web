import { Injectable } from '@angular/core';
import { ValueType } from '@flogo/core';
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
      case ValueType.String:
        return new Textbox({
          name: field.name,
          type: field.type,
          value: field.value
        });
      case ValueType.Number:
      case ValueType.Integer:
        return new NumberType({
          name: field.name,
          type: field.type,
          value: field.value
        });
      case ValueType.Params:
        return new Textarea({
          name: field.name,
          type: field.type,
          value: field.value
        });
      case ValueType.Boolean:
        return new Radio({
          name: field.name,
          type: field.type,
          value: field.value
        });
      case ValueType.Object:
      case ValueType.Any:
      case ValueType.ComplexObject:
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

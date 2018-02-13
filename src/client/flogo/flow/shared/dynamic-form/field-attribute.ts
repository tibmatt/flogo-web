import { ValueTypes } from '@flogo/core';

export interface FieldAttribute {
  name: string;
  type: ValueTypes.ValueType;
  value?: any;
}

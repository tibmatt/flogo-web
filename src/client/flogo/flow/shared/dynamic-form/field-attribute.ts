import { ValueType } from '@flogo/core';

export interface FieldAttribute {
  name: string;
  type: ValueType;
  value?: any;
}

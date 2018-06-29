import { ValueType } from '@flogo/core/constants';

export interface AppProperty {
  name: string;
  type: ValueType;
  value: any;
}

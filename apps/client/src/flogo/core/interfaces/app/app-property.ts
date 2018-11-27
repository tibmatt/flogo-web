import { ValueType } from '@flogo-web/client/core/constants';

export interface AppProperty {
  name: string;
  type: ValueType;
  value: any;
}

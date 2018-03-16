import { ValueType } from '../../constants';

export interface MetadataAttribute {
  name: string;
  type: ValueType;
  value?: any;
}

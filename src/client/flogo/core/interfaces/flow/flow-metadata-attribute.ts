import { ValueTypes } from '../../constants';

export interface MetadataAttribute {
  name: string;
  type: ValueTypes.ValueType;
  value?: any;
}

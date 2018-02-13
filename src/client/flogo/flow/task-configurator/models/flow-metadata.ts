import { ValueTypes } from '@flogo/core/constants';

export interface FlowMetadata {
  type: 'metadata';
  input: Array<{ name: string; type: ValueTypes.ValueType; }>;
  output: Array<{ name: string; type: ValueTypes.ValueType; }>;
}

import { ValueType } from '@flogo/core/constants';

export interface FlowMetadata {
  type: 'metadata';
  input: Array<{ name: string; type: ValueType; }>;
  output: Array<{ name: string; type: ValueType; }>;
}

export interface FlowMetadata {
  type: 'metadata';
  input: Array<{ name: string; type: string; }>;
  output: Array<{ name: string; type: string; }>;
}

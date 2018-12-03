export interface Task {
  id: string;
  type: number;
  activityRef: string;
  name?: string;
  description?: string;
  attributes?: Attribute[];
  inputMappings?: Mapping[];
  settings?: any;
  outputMappings?: Mapping[];
}

interface Attribute {
  id: number | string;
  name?: string;
  from: string;
  to: string;
  type?: number;
  value?: string;
}

interface Mapping {
  mapTo: string;
  type: number;
  value: any;
}

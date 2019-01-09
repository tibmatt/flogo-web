export interface Task {
  id: string;
  type: number;
  activityRef: string;
  name?: string;
  description?: string;
  attributes?: Attribute[];
  inputMappings?: {[property: string]: any};
  settings?: {
    flowPath?: string;
    iterate: string;
  };
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

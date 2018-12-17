export namespace flow {
  export interface Attribute {
    name: string;
    type: string;
    value: any;
  }

  export interface Task {
    id: string;
    type: number;
    activityRef: string;
    name?: string;
    description?: string;
    attributes?: Attribute[];
    inputMappings?: any;
    settings?: any;
    outputMappings?: Mapping[];
  }

  export interface Mapping {
    mapTo: string;
    type: number;
    value: any;
  }

  export interface Link {
    id: number | string;
    name?: string;
    from: string;
    to: string;
    type?: number;
    value?: string;
  }
}

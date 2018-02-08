import { flow } from './flow';

export interface Action {
  id: string;
  type: string;
  ref: string;
  name: string;
  description?: string;
  metadata?: metadata.Metadata;
  data: {
    flow?: flow.Flow;
  };
}

export namespace metadata {
  export interface Metadata {
    input?: Attribute[];
    output?: Attribute[];
  }

  export interface Attribute {
    name: string;
    type: string;
  }
}

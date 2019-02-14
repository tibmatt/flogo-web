export interface BaseContributionSchema {
  name: string;
  type: string;
  ref: string;
  version: string;
  title?: string;
  description?: string;
  homepage?: string;
}

export interface SchemaOutput {
  name: string;
  // todo: use enum
  type: string;
}

export interface SchemaAttributeDescriptor {
  name: string;
  // todo: use enum
  type: string;
  required?: boolean;
  allowed?: any[];
  value?: any;
  display?: {
    name?: string;
    type: string;
    mapperOutputScope?: string;
  };
}

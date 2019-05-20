export interface Resource<TResourceData = unknown> {
  id: string;
  name: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  metadata?: Metadata;
  data: TResourceData;
}

// todo: check if input/output should be optional as per core schema
export interface Metadata {
  input: MetadataAttribute[];
  output: MetadataAttribute[];
}

export interface MetadataAttribute {
  name: string;
  type: string;
  value?: any;
}

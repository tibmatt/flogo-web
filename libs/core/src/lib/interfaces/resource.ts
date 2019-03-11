export interface Resource<TResourceData = any> {
  id: string;
  name: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  metadata?: Metadata;
  data: TResourceData;
}

export interface Metadata {
  input: MetadataAttribute[];
  output: MetadataAttribute[];
}

export interface MetadataAttribute {
  name: string;
  type: string;
  value?: any;
}

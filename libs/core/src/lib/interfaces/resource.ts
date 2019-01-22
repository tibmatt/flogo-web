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

interface Metadata {
  input: MetadataAttribute[];
  output: MetadataAttribute[];
}

interface MetadataAttribute {
  name: string;
  type: string;
  value?: any;
}

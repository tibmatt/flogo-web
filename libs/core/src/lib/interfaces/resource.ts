export interface Resource<TResourceData = unknown> {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  data: TResourceData;
}

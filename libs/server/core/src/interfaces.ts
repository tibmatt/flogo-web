export interface Newable<T> {
  new (...args: any[]): T;
}

export interface ResourceRegistrarParams {
  resourceType: string;
  resourceHooks: Newable<ResourceHooks>;
}
export type ResourceRegistrarFn = (params: ResourceRegistrarParams) => void;

export interface Resource<TResourceData = unknown> {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  data: TResourceData;
}

export interface ResourceHooks<TResourceData = unknown> {
  beforeCreate(resource: Resource<TResourceData>): Promise<Resource<TResourceData>>;
  onImport(data: object): Promise<Resource<TResourceData>>;
  beforeUpdate(resource: Resource<TResourceData>): Promise<Resource<TResourceData>>;
  beforeExport(resource: Resource<TResourceData>): Promise<object>;
  beforeList(resource: Resource<TResourceData>): Promise<Resource<TResourceData>>;
}

export type GenericResourcePlugin = ResourceHooks<Resource>;

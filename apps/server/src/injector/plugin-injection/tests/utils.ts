import { ResourceHooks, Resource, Newable } from '@flogo-web/server/core';

export function generateMockHooksImplementation(): Newable<ResourceHooks> {
  return class ResourcePluginExample implements ResourceHooks {
    async beforeCreate(resource: Resource) {
      return resource;
    }
    async onImport(data: object) {
      return data as Resource;
    }
    async beforeUpdate(resource: Resource) {
      return resource;
    }
    async beforeExport(resource: Resource) {
      return resource;
    }
    async beforeList(resource: Resource) {
      return resource;
    }
  };
}

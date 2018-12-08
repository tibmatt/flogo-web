import { inject, injectable } from 'inversify';
import { ResourceHooks, Resource } from '@flogo-web/server/core';
import { TOKENS } from '../../core/tokens';

const fakeDb: { [id: string]: Resource } = {
  idFlow: {
    id: 'idFlow',
    type: 'flow',
    name: 'my flow',
    createdAt: null,
    updatedAt: null,
    data: {
      internalInfo: 'this is secret',
      tasks: [{ id: 't1', ref: 'log' }],
      link: [],
    },
  },
  idTest: {
    id: 'idTest',
    type: 'test',
    name: 'test resource',
    createdAt: null,
    updatedAt: null,
    data: {
      stages: [1, 2, 3],
    },
  },
};

@injectable()
export class ResourceService {
  constructor(
    @inject(TOKENS.ResourcePluginFactory)
    private resolvePlugin: (resourceType: string) => ResourceHooks
  ) {}

  isTypeSupported(type: string) {
    return !!type && this.resolvePlugin(type) !== null;
  }

  async list(): Promise<Resource[]> {
    return mapAsync<Resource>(Object.values(fakeDb), resource =>
      this.resolvePlugin(resource.type).beforeList({ ...resource })
    );
  }

  async findOne(resourceId: string) {
    const resource = fakeDb[resourceId];
    if (!resource) {
      return null;
    }
    const plugin = this.resolvePlugin(resource.type);
    if (plugin) {
      return await plugin.beforeList({ ...resource });
    }
    return null;
  }
}

function mapAsync<T>(collection = [], mapFn: (e) => Promise<T>): Promise<T[]> {
  return Promise.all(collection.map(mapFn));
}

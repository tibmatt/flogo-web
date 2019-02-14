import { ResourceHooks } from '@flogo-web/server/core';

export type PluginResolverFn = (resourceType: string) => ResourceHooks;

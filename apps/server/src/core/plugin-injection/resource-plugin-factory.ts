import { Container, interfaces } from 'inversify';
import { ResourceHooks } from '@flogo-web/server/core';
import { TOKENS } from '../tokens';

export function bindResourcePluginFactory(container: Container) {
  container
    .bind<interfaces.Factory<ResourceHooks>>(TOKENS.ResourcePluginFactory)
    .toFactory<ResourceHooks>(resourcePluginFactory);
}

export function resourcePluginFactory(
  context: interfaces.Context
): interfaces.Factory<ResourceHooks> {
  return (name: string) => {
    if (context.container.isBoundNamed(TOKENS.ResourcePlugin, name)) {
      return context.container.getNamed<ResourceHooks>(TOKENS.ResourcePlugin, name);
    }
    return null;
  };
}

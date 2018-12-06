import { Container, injectable, decorate, METADATA_KEY } from 'inversify';
import {
  ResourceHooks,
  ResourceRegistrarFn,
  ResourceRegistrarParams,
} from '@flogo-web/server/core';
import { TOKENS } from '../tokens';

export function createResourceRegistrar(container: Container): ResourceRegistrarFn {
  return function registerResourcePlugin(params) {
    validatePluginOptions(container, params);
    const { resourceType, resourceHooks } = params;
    if (!isInjectable(resourceHooks)) {
      decorate(injectable(), resourceHooks);
    }
    container
      .bind<ResourceHooks>(TOKENS.ResourcePlugin)
      .to(resourceHooks)
      .whenTargetNamed(resourceType);
  };
}

function isInjectable(target) {
  return Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, target);
}

function validatePluginOptions(
  container: Container,
  { resourceType, resourceHooks }: ResourceRegistrarParams
) {
  if (!resourceType) {
    throw new Error(
      'Missing required parameter "resourceType" [missingParam:resourceType]'
    );
  }
  if (!resourceHooks) {
    throw new Error(
      'Missing required parameter "resourcePluginClass" [missingParam:resourceHooksClass]'
    );
  }
  if (container.isBoundNamed(TOKENS.ResourcePlugin, resourceType)) {
    throw new Error(
      `Cannot register plugin for resource type '${resourceType}', another plugin for that type is already registered (class ${resourceHooks} ). [pluginTypeAlreadyRegistered]`
    );
  }
}

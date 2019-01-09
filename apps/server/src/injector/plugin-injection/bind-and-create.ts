import { Container } from 'inversify';
import { ResourceRegistrarFn } from '@flogo-web/server/core';
import { bindResourcePluginFactory } from './resource-plugin-factory';
import { createResourceRegistrar } from './resource-registrar';

export function bindAndCreatePluginRegistrar(container: Container): ResourceRegistrarFn {
  bindResourcePluginFactory(container);
  return createResourceRegistrar(container);
}

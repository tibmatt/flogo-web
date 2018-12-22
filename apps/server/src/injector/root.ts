import 'reflect-metadata';
import { Container } from 'inversify';
import { ResourceRegistrarFn } from '@flogo-web/server/core';

import { TOKENS } from '../core';
import { logger } from '../common/logging';
import { ResourceRepository } from '../modules/resources/resource.repository';
import { TransitionalResourceRepository } from '../modules/resources/transitional-resource.repository';

import { bindAndCreatePluginRegistrar } from './plugin-injection';
import { InOutModule } from './inout/module';
import { PersistenceModule } from './persistence/module';
import { ModelsModule } from './models/module';

export function createRootContainer(): {
  rootContainer: Container;
  registerResourcePlugin: ResourceRegistrarFn;
} {
  const rootContainer = new Container();
  rootContainer.bind(TOKENS.Logger).toConstantValue(logger);
  rootContainer.bind(ResourceRepository).to(TransitionalResourceRepository);
  rootContainer.load(PersistenceModule, ModelsModule, InOutModule);
  const registerResourcePlugin = bindAndCreatePluginRegistrar(rootContainer);
  return {
    rootContainer,
    registerResourcePlugin,
  };
}

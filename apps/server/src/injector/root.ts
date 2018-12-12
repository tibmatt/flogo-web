import 'reflect-metadata';
import { Container } from 'inversify';
import { createResourceRegistrar, bindResourcePluginFactory } from './plugin-injection';

import { apps, indexer } from '../common/db';
import { logger } from '../common/logging';

import { TOKENS } from '../core';
import { ResourceService } from '../modules/resources';

const container = new Container();

container.bind(ResourceService).toSelf();
container.bind(TOKENS.AppsDb).toConstantValue(apps);
container.bind(TOKENS.ActionIndexerDb).toConstantValue(indexer);
container.bind(TOKENS.Logger).toConstantValue(logger);

bindResourcePluginFactory(container);
const registerResourcePlugin = createResourceRegistrar(container);

export { container, registerResourcePlugin };

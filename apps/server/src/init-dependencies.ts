import 'reflect-metadata';
import { PluginRegistry } from './extension';
import { createRootContainer } from './injector';
import { loadPlugins } from './plugins';

const rootContainer = createRootContainer();
loadPlugins({ resources: rootContainer.get(PluginRegistry) });

export { rootContainer };

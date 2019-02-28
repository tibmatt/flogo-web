import 'reflect-metadata';
import { ResourcePluginRegistry, ServerPluginRegistrar } from './extension';
import { createRootContainer } from './injector';
import { loadPlugins } from './plugins';

const rootContainer = createRootContainer();
loadPlugins(new ServerPluginRegistrar(rootContainer.get(ResourcePluginRegistry)));

export { rootContainer };

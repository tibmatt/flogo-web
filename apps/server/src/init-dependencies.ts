import 'reflect-metadata';
import { ResourcePluginRegistry, ServerPluginRegistrar } from './extension';
import { createRootContainer } from './injector';
import { loadPlugins } from './plugins';
import { setDefaultResourceTypes } from './modules/engine';

const rootContainer = createRootContainer();
initPlugins();

export { rootContainer };

function initPlugins() {
  const pluginRegistry = rootContainer.get(ResourcePluginRegistry);
  loadPlugins(new ServerPluginRegistrar(pluginRegistry));
  setDefaultResourceTypes(pluginRegistry.resourceTypes.allRefs());
}

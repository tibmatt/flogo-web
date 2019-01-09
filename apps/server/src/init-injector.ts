import { createRootContainer } from './injector';
import { loadPlugins } from './plugins';
import { ActionsManager } from './modules/actions';

const { rootContainer, registerResourcePlugin } = createRootContainer();
loadPlugins(registerResourcePlugin);
// transitional
// todo: remove, actions manager will be removed once we moved to resource plugins
ActionsManager.setContainer(rootContainer);

export { rootContainer, registerResourcePlugin };

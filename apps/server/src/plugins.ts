import { flowPlugin } from '@flogo-web/plugins/flow-server';
import { ServerPluginRegistrar } from './extension';

export function loadPlugins(registrar: ServerPluginRegistrar) {
  registrar.use(flowPlugin);
}

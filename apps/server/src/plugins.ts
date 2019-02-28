import { PluginRegistrar } from '@flogo-web/server/core';
import { flowPlugin } from '@flogo-web/plugins/flow-server';

export function loadPlugins(registrar: PluginRegistrar) {
  registrar.use(flowPlugin);
}

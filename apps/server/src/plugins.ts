import { flowPlugin } from '@flogo-web/plugins/flow-server';
import { streamPlugin } from '@flogo-web/plugins/stream-server';
import { ExtensionsServer } from './extension';
import { isFeatureEnabled } from './config';

export function loadPlugins(flogoServer: ExtensionsServer) {
  flogoServer.use(flowPlugin);

  // todo: remove check after streams is completed
  if (isFeatureEnabled('STREAMS')) {
    flogoServer.use(streamPlugin);
  }
}

import { flowPlugin } from '@flogo-web/plugins/flow-server';
import { streamPlugin } from '@flogo-web/plugins/stream-server';
import { ExtensionsServer } from './extension';
import { isFeatureEnabled } from './config';
import { organicPlugin } from '@flogo-web/plugins/organic-server';

export function loadPlugins(flogoServer: ExtensionsServer) {
  flogoServer.use(flowPlugin);

  // todo: remove check after streams is completed
  if (isFeatureEnabled('STREAMS')) {
    flogoServer.use(streamPlugin);
  }
  flogoServer.use(organicPlugin);
}

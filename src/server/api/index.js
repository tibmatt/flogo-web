import { errorHandler } from './error';
import { engine } from './engine';
import { ping } from './ping';
import { flowsRun } from './flows.run';

import { registerRoutes as registerRoutesV2 } from './v2';

export function api(app, router) {
  errorHandler(app, router);
  engine(app, router);
  ping(app, router);
  flowsRun(app, router);
  registerRoutesV2(router);
}
export default api;

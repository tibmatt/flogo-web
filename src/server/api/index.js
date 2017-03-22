import { activities } from './activities';
import { triggers } from './triggers';
import { flows } from './flows';
import { apps } from './apps';
import { errorHandler } from './error';
import { flowsDetail } from './flows.detail';
import { engine } from './engine';
import { ping } from './ping';
import { configuration } from './configuration';
import { flowsRun } from './flows.run';

import { apps as appsV2 } from './apps/index.v2';

export function api(app, router) {
  errorHandler(app, router);
  activities(app, router);
  triggers(app, router);
  apps(app, router);
  flows(app, router);
  flowsDetail(app, router);
  engine(app, router);
  ping(app, router);
  flowsRun(app, router);
  configuration(app, router);

  appsV2(router);
}
export default api;

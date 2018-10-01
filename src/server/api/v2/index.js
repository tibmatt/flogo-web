import { config } from '../../config/app-config';
import { apps } from './apps';
import { triggers } from './triggers';
import { actions } from './actions';
import { contribs as deviceContribs } from './contribs/devices';
import { contribs as microserviceContribs } from './contribs/microservices';
import { handlers } from './handlers';

export function registerRoutes(router) {
  const basePathV2 = config.app.basePathV2;
  apps(router, basePathV2);
  triggers(router, basePathV2);
  actions(router, basePathV2);
  deviceContribs(router, basePathV2);
  microserviceContribs(router, basePathV2);
  handlers(router, basePathV2);
}

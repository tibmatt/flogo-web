import * as Router from 'koa-router';
const RouterClass = require('koa-router');

import { config } from '../../config/app-config';
import { apps } from './apps';
import { triggers } from './triggers';
import { actions } from './actions';
import { contribs as deviceContribs } from './contribs/devices';
import { contribs as microserviceContribs } from './contribs/microservices';
import { handlers } from './handlers';
import { mountServices } from './services';
import { mountEngine } from './engine';
import { v2ErrorMiddleware } from '../error';

export function createRouter(): Router {
  const router = new RouterClass({
    prefix: config.app.basePathV2,
  });
  router.use(v2ErrorMiddleware);
  apps(router);
  triggers(router);
  actions(router);
  deviceContribs(router);
  microserviceContribs(router);
  handlers(router);
  mountServices(router);
  mountEngine(router);
  return router;
}

import * as Router from 'koa-router';
const RouterConstructor = require('koa-router');

import { config } from '../../config/app-config';
import { errorMiddleware } from './error-middleware';
import { apps } from './apps';
import { triggers } from './triggers';
import { actions } from './actions';
import { contribs as microserviceContribs } from './contribs/microservices';
import { handlers } from './handlers';
import { mountServices } from './services';
import { mountEngine } from './engine';
import { mountTestRunner } from './runner';

export function createRouter(): Router {
  const router = new RouterConstructor({
    prefix: config.app.basePathV2,
  });
  router.use(errorMiddleware);
  apps(router);
  triggers(router);
  actions(router);
  microserviceContribs(router);
  handlers(router);
  mountServices(router);
  mountEngine(router);
  mountTestRunner(router);
  return router;
}

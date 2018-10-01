import * as Router from 'koa-router';
const RouterClass = require('koa-router');

import { config } from '../../config/app-config';

import { engine } from './engine';
import { ping } from './ping';
import { flowsRun } from './flows.run';
import { v1ErrorMiddleware } from '../error';

export function createRouter(): Router {
  const router = new RouterClass({
    prefix: config.app.basePath,
  });
  router.use(v1ErrorMiddleware);
  engine(router);
  ping(router);
  return router;
}

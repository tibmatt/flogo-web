import * as Router from 'koa-router';
import { createInstancesRouter } from './instances';
import { createProcessesRouter } from './processes';

const RouterConstructor = require('koa-router');

const createRouter = (opts?: Router.IRouterOptions): Router =>
  new RouterConstructor(opts);

export function mountTestRunner(appRouter: Router) {
  const runner = createRouter({ prefix: '/runner' });

  [createProcessesRouter, createInstancesRouter].forEach(subrouterFactory => {
    const subrouter: Router = subrouterFactory(createRouter);
    runner.use(subrouter.routes(), subrouter.allowedMethods());
  });
  appRouter.use(runner.routes(), runner.allowedMethods());
}

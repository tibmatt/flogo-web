import * as Router from 'koa-router';

import { createRouter as createV1Router } from './v1';
import { createRouter as createV2Router } from './v2';

export function mountRestApi(appRouter: Router) {
  const v1Router = createV1Router();
  appRouter.use(v1Router.routes(), v1Router.allowedMethods());
  const v2Router = createV2Router();
  appRouter.use(v2Router.routes(), v2Router.allowedMethods());
}

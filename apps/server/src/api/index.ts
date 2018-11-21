import * as Router from 'koa-router';

import { createRouter as createV2Router } from './v2';

export function mountRestApi(appRouter: Router) {
  const v2Router = createV2Router();
  appRouter.use(v2Router.routes(), v2Router.allowedMethods());
}

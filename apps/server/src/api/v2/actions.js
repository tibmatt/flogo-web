const Router = require('koa-router');
import { isArray } from 'lodash';
import {
  unflowify,
  flowify,
} from '../../modules/resources/transitional-resource.repository';

import { createResourceMiddleware } from './resources/resource-service-middleware';
import { listResources } from './resources/list-resources';
import { listRecent } from './resources/list-recent';
import { createResource } from './resources/create-resource';
import { getResource } from './resources/get-resource';
import { updateResource } from './resources/update-resource';
import { deleteResource } from './resources/delete-resource';

export function actions(router, container) {
  const resourceServiceMiddleware = createResourceMiddleware(container);
  router.get(
    `/apps/:appId/actions`,
    resourceServiceMiddleware,
    flowifyResponse,
    listResources
  );
  router.post(
    `/apps/:appId/actions`,
    resourceServiceMiddleware,
    unflowifyRequest,
    flowifyResponse,
    createResource
  );

  const actions = new Router();
  actions
    .get(`/recent`, listRecent)
    .get(`/:resourceId`, flowifyResponse, getResource)
    .patch(`/:resourceId`, unflowifyRequest, flowifyResponse, updateResource)
    .del(`/:resourceId`, deleteResource);
  router.use(
    '/actions',
    resourceServiceMiddleware,
    actions.routes(),
    actions.allowedMethods()
  );
}

async function unflowifyRequest(ctx, next) {
  if (ctx.request.body) {
    ctx.request.body = unflowify(ctx.request.body);
  }
  await next();
}

async function flowifyResponse(ctx, next) {
  await next();
  if (isArray(ctx.body.data)) {
    ctx.body.data = ctx.body.data.map(flowify);
  } else if (ctx.body.data) {
    ctx.body.data = flowify(ctx.body.data);
  }
}

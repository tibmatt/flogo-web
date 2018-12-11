import * as Router from 'koa-router';
import { Container } from 'inversify';
import { ResourceService } from '../../modules/resources';

export function resources(router: Router, container: Container) {
  const resourcesService = container.resolve(ResourceService);

  router.get('/resources', async ctx => {
    ctx.body = { data: await resourcesService.list() };
  });

  router.get('/resources:supported', async ctx => {
    ctx.body = {
      data: resourcesService.isTypeSupported(ctx.request.query.type),
    };
  });
  router.get('/resources/:resourceId', async ctx => {
    const resource = await resourcesService.findOne(ctx.params.resourceId);
    if (resource) {
      ctx.body = { data: resource };
    } else {
      ctx.status = 404;
      ctx.body = { error: 'not found' };
    }
  });
}

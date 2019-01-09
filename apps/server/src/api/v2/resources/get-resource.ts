import { Context } from 'koa';
import { ErrorManager } from '../../../common/errors';
export async function getResource(ctx: Context, next) {
  const resourceId = ctx.params.resourceId;
  const resource = await ctx.resourceService.findOne(resourceId);
  if (!resource) {
    throw ErrorManager.createRestNotFoundError('Resource not found', {
      title: 'Resource not found',
      detail: 'No resource with the specified id',
      value: resourceId,
    });
  }
  ctx.body = {
    data: resource,
  };
}

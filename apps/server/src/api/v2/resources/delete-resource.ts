import { Context } from 'koa';
import { ErrorManager } from '../../../common/errors';
export async function deleteResource(ctx: Context, next) {
  const resourceId = ctx.params.resourceId;
  const removed = await ctx.resourceService.remove(resourceId);
  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Resource not found', {
      title: 'Resource not found',
      detail: 'No resource with the specified id',
      value: resourceId,
    });
  }
  ctx.status = 204;
}

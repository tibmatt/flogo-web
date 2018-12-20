import { Context } from 'koa';
export async function listRecent(ctx: Context, next) {
  const appId = ctx.params.appId;
  const resourceList = await ctx.resourceService.listRecent();
  ctx.body = {
    data: resourceList || [],
  };
}

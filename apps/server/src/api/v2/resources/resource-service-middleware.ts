import { Container } from 'inversify';
import { Context } from 'koa';
import { ResourceService } from '../../../modules/resources';

declare module 'koa' {
  interface Context {
    resourceService: ResourceService;
  }
}

export function createResourceMiddleware(container: Container) {
  const resourceService = container.resolve(ResourceService);
  return (ctx: Context, next) => {
    ctx.resourceService = resourceService;
    return next();
  };
}

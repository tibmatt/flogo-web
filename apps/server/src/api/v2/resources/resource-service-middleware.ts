import { Container } from 'inversify';
import { Middleware, ParameterizedContext } from 'koa';
import { ResourceService } from '../../../modules/resources';
import { IMiddleware as RouterMiddleware } from 'koa-router';

export type ResourceServiceContext = ParameterizedContext<
  any,
  ResourceServiceContextData
>;

export interface ResourceServiceContextData {
  resourceService: ResourceService;
}

export function createResourceMiddleware(
  container: Container
): RouterMiddleware<any, ResourceServiceContextData> {
  const resourceService = container.resolve(ResourceService);
  return (ctx: ResourceServiceContext, next) => {
    ctx.resourceService = resourceService;
    return next();
  };
}

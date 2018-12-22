import { Context, Middleware } from 'koa';
import { Container } from 'inversify';
import { AppsService } from '../../../modules/apps';
import { AppTriggersService } from '../../../modules/apps/triggers';

declare module 'koa' {
  interface Context {
    appsService?: AppsService;
    appTriggersService?: AppTriggersService;
  }
}

export function appsServiceMiddleware(container: Container): Middleware {
  const appsService = container.resolve(AppsService);
  return (ctx: Context, next) => {
    ctx.appsService = appsService;
    return next();
  };
}

export function appTriggersServiceMiddleware(container: Container): Middleware {
  const appTriggerService = container.resolve(AppTriggersService);
  return (ctx: Context, next) => {
    ctx.appTriggersService = appTriggerService;
    return next();
  };
}

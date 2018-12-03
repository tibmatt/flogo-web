import { Context } from 'koa';
import { logger } from '../../common/logging/app';
import { config } from '../../config/app-config';
import { getInitializedEngine } from '../../modules/engine';

export function mountEngine(router) {
  router.post('/engine/restart', restartEngine);
}

async function restartEngine(ctx: Context, next) {
  const data = {
    status: 200,
  };

  try {
    const engine = await getInitializedEngine(config.defaultEngine.path);

    const stopTestEngineResult = await engine.stop();
    let startTestEngineResult = false;

    if (stopTestEngineResult) {
      startTestEngineResult = await engine.start();
    } else {
      data.status = 500;
      logger.warn('[engine] failed while stopping engine');
    }

    if (!startTestEngineResult) {
      data.status = 500;
      logger.warn('[engine] failed while starting engine');
    }

    ctx.body = data;
  } catch (err) {
    logger.error(err);
    data.status = 500;
    ctx.body = data;
  }
  next();
}

import {config} from '../../../config/app-config';
import { getInitializedEngine } from '../../../modules/engine/index';

export function engine(router){
  router.get('/engine/restart', restartEngine);
}

/**
 * @swagger
 *  /engine/restart:
 *    get:
 *      tags:
 *        - Engine
 *      responses:
 *        200:
 *          description: Engine restarted sucessfully.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: number
 *                default: 200
 *        500:
 *          description: Error restarting the engine.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: number
 *                default: 500
 */
async function restartEngine(ctx, next) {
  console.log('Restart Engine');
  let data = {
    status: 200
  };

  try{
    let engine = await getInitializedEngine(config.defaultEngine.path);

    let stopTestEngineResult = await engine.stop();
    let startTestEngineResult = false;

    if (stopTestEngineResult) {
      startTestEngineResult = await engine.start();
    } else {
      data.status = 500;
      console.log("[error] didn't stop successful");
    }

    if (!startTestEngineResult) {
      data.status = 500;
      console.log("[error] didn't start successful");
    }

    this.body = data;
    return next();
  } catch(err) {
    console.log("[error][restartEngine]: ", err);
    data.status = 500;
    this.body = data;
    return next();
  }
}

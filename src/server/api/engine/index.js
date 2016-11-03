import {config} from '../../config/app-config';
import { getInitialisedTestEngine, getInitialisedBuildEngine } from '../../modules/engine';
import _ from 'lodash';

let basePath = config.app.basePath;

export function engine(app, router){
  if(!app){
    console.error("[Error][api/engine/index.js]You must pass app");
  }
  router.get(basePath+"/engine/restart", restartEngine);


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
function* restartEngine(next){
  console.log('Restart Engine');
  let data = {
    status: 200
  };

  try{
    let name = this.query&&this.query.name? this.query&&this.query.name: "test";

    let testEngine = yield getInitialisedTestEngine();

    if ( name == "build" ) {
      testEngine = yield getInitialisedBuildEngine();
    }

    let stopTestEngineResult = yield testEngine.stop();
    let startTestEngineResult = false;

    if (stopTestEngineResult) {
      startTestEngineResult = yield testEngine.start();
    } else {
      data.status = 500;
      console.log("[error] didn't stop successful");
    }

    if (!startTestEngineResult) {
      data.status = 500;
      console.log("[error] didn't start successful");
    }

    this.body = data;
    yield next;
  }catch(err){
    console.log("[error][restartEngine]: ", err);
    data.status = 500;
    this.body = data;
    yield next;
  }
}

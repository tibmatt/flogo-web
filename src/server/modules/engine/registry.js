import path from 'path';

import {Engine} from './engine';
import {engineLogger} from '../../common/logger';
import {config} from '../../config/app-config';

let engineRegistry = {};

/**
 * Gets initialized engine
 * @param enginePath {string} name/path of the engine
 * @param opts {object}
 * @param opts.forceCreate {boolean} default false
 * @returns {*}
 */
export function getInitializedEngine(enginePath, opts) {
  if (engineRegistry[enginePath]) {
    return Promise.resolve(engineRegistry[enginePath]);
  }

  let engine = new Engine(enginePath, opts.libVersion||config.libVersion, engineLogger);
  engineRegistry[enginePath] = engine;

  return initEngine(engine, opts)
    .then(() =>  {
    engineRegistry[enginePath] = engine;
    return engine;
  });

}

export function initEngine(engine, options) {
  let forceInit = options && options.forceCreate;
  return engine.exists()
    .then(function(engineExists){
      if (engineExists && forceInit) {
        return engine.remove().then(() => true);
      }
      return !engineExists || forceInit;
    })
    .then(create => {
      if(create) {
        console.info('Engine does not exist. Creating...');
        return engine.create()
          .then(() => {
            console.info('New engine created');
            // TODO: add palette version
            let palettePath = path.resolve('config', config.defaultEngine.defaultPalette);
            console.info('Will install palette at ' + palettePath);
            return engine.installPalette(palettePath);
          })
          .catch(error => {
            console.error('Error initializing engine. Will try to clean up');
            return engine.remove().then(() => {
              console.log('Successful clean');
              throw new Error(error);
            })
          });
      }
    })
    .then(() => engine.load())
    .then(console.log)
    .then(() => {
      return Promise.all([
        // update config.json, use overwrite mode
        engine.updateConfig(config.testEngine.config, {overwrite: true}),
        // update triggers.json
        engine.updateTriggersConfig({
          'triggers': config.testEngine.triggers
        }, {overwrite: true})
      ]);
    })
}



import {Engine} from '../engine/engine';
import {config} from '../../config/app-config';
import path from 'path';

let engineRegistry = {};

export function getInitializedEngine(enginePath) {
  if (engineRegistry[enginePath]) {
    return Promise.resolve(engineRegistry[enginePath]);
  }

  let engine = new Engine(enginePath);

  return engine.exists()
    .then(function(engineExists){
      if(!engineExists) {
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
    .then(() =>  {
      engineRegistry[enginePath] = engine;
      return engine;
    });

}



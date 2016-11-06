import path from 'path';

import merge from 'lodash/merge';
import find from 'lodash/find';

import {readJSONFile, writeJSONFile} from '../../../common/utils';

module.exports = {
  update: {
    config(enginePath, configData, options = {}) {
      let binPath = path.join(enginePath, 'bin');
      let configJSONPath = path.join(binPath, 'config.json');

      let promise = Promise.resolve(configData);
      if (!options.overwrite) {
        promise = readJSONFile(configJSONPath)
          .then(currentConfig => {
            return merge({}, currentConfig, configData);
          });
      }

      return promise.then(configData => {
        return writeJSONFile(configJSONPath, configData)
          .then(() => console.log("[success][engine->updateConfigJSON]"))
          .then(Promise.resolve(configData));
      })
        .catch(err => {
          console.error("[error][engine->updateConfigJSON] error: ", err);
          return Promise.reject(err);
        })
    },
    triggersConfig(enginePath, triggersData, options = {}) {
      let binPath = path.join(enginePath, 'bin');
      let triggersJSONPath = path.join(binPath, 'triggers.json');

      console.log("[debug][engine->updateTriggerJSON], options: ", options);

      let promise = Promise.resolve(triggersData);
      if (!options.overwrite) {
        promise = readJSONFile(triggersJSONPath)
          .then(currentTriggersData => {

            let newTriggersData = {
              "triggers": []
            };
            let currentTriggers = currentTriggersData&&currentTriggersData.triggers || [];
            let newTriggers = triggersData&&triggersData.triggers || [];

            currentTriggers.forEach(trigger => {
              // find the config for this trigger
              let newTrigger = find(newTriggers, {'name': trigger&&trigger.name}) || {};
              newTriggersData.triggers.push(merge({}, trigger, newTrigger));
            });

            return newTriggersData;
          });
      }

      return promise.then(updatedTriggersData => {
        return writeJSONFile(triggersJSONPath, updatedTriggersData)
          .then(() => console.log("[success][engine->updateTriggerJSON]", updatedTriggersData))
          .then(Promise.resolve(updatedTriggersData));
      })
        .catch(err => {
          console.error("[error][engine->updateTriggerJSON] error: ", err);
          return Promise.reject(err);
        });

    }
  }

};

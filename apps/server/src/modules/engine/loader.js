import * as fs from 'fs';

import groupBy from 'lodash/groupBy';

import { readJSONFile } from '../../common/utils/file';
import { normalizeContribSchema } from '../../common/contrib-schema-normalize';

export const loader = {
  exists(enginePath) {
    return new Promise((resolve, reject) => {
      fs.stat(enginePath, (err, stats) => {
        if (err && err.code === 'ENOENT') {
          return resolve(false);
        } else if (err) {
          return reject(err);
        }
        if (stats.isFile() || stats.isDirectory()) {
          return resolve(true);
        }
      });
    });
  },
  /**
   *
   * @param {Object[]} contributions - contributions to read
   * @param {string} contributions[].type - activity or trigger, any other type will be ignored
   * @param {string} contributions[].ref - ref to the contribution
   */
  loadMetadata(contributions) {
    const groupedByType = groupBy(contributions, 'type');
    const triggersToRead = groupedByType['flogo:trigger'] || [];
    const activitiesToRead = groupedByType['flogo:activity'] || [];
    const functionsToRead = groupedByType['flogo:function'] || [];

    const refToPath = ({ path, ref, isLegacy }) => ({ path, ref, isLegacy });
    return Promise.all([
      _readTasksNew(triggersToRead.map(refToPath)).then(triggers =>
        triggers.map(trigger => {
          // rt === schema of the trigger
          trigger.rt = normalizeContribSchema(trigger.rt);
          return trigger;
        })
      ),
      _readTasksNew(activitiesToRead.map(refToPath)).then(activities =>
        activities.map(activity => {
          // rt === schema of the activity
          activity.rt = normalizeContribSchema(activity.rt);
          return activity;
        })
      ),
      _readTasksNew(functionsToRead.map(refToPath)).then(functions =>
        functions.map(eachFunction => {
          // rt === schema of the activity
          eachFunction.rt = normalizeContribSchema(eachFunction.rt);
          return eachFunction;
        })
      ),
    ]).then(([triggers, activities, functions]) => ({ triggers, activities, functions }));
  },
};

function _readTasksNew(data) {
  if (!data) {
    return Promise.resolve([]);
  }

  return Promise.all(
    data.map(function(taskInfo) {
      return (
        readJSONFile(taskInfo.path)
          // rt means "runtime", the name was used to differentiate the ui descriptor versus the runtime descriptor,
          // now that the metadata is consolidated "rt" qualifier is not necessary anymore
          // todo: change "rt" to a more descriptive name
          .then(schema =>
            Object.assign({}, taskInfo, { rt: { ...schema, ref: taskInfo.ref } })
          )
      );
    })
  );
}

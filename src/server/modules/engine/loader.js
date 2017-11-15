import * as fs from 'fs';
import * as path from 'path';

import groupBy from 'lodash/groupBy';
import clone from 'lodash/clone';

import { readJSONFile } from '../../common/utils/file';

const TASK_SRC_ROOT = 'vendor/src';

module.exports = {
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
  readFlogo,
  readAllTasks(enginePath, taskData){
    var taskDataPromise;

    if (!taskData) {
      taskDataPromise = readFlogo(enginePath);
    } else {
      taskDataPromise = Promise.resolve(taskData);
    }

    return taskDataPromise.then(function dataTransformer(data) {
      return Promise.all([
        _readTasks(enginePath, 'trigger', data.triggers),
        _readTasks(enginePath, 'activity', data.activities),
      ]).then(function (result) {
        return {
          triggers: result[0],
          activities: result[1]
        };
      });
    });
  },
  /**
   *
   * @param {string} enginePath - path to engine
   * @param {Object[]} contributions - contributions to read
   * @param {string} contributions[].type - activity or trigger, any other type will be ignored
   * @param {string} contributions[].ref - ref to the contribution
   */
  loadMetadata(enginePath, contributions) {
    const groupedByType = groupBy(contributions, 'type');
    const triggersToRead = groupedByType.trigger || [];
    const activitiesToRead = groupedByType.activity || [];

    const refToPath = el => ({ path: el.ref });

    return Promise.all([
      _readTasks(enginePath, 'trigger', triggersToRead.map(refToPath))
        .then(triggers => triggers.map(trigger => {
          // change to "old" name to support new definition without affecting the rest of the application
          // (outputs => output)
          // rt === schema of the trigger
          if (trigger.rt.output) {
            trigger.rt.outputs = clone(trigger.rt.output);
          }
          return trigger;
        })),
      _readTasks(enginePath, 'activity', activitiesToRead.map(refToPath))
        .then(activities => activities.map(activity => {
          // change to "old" name to support new definition without affecting the rest of the application
          // (inputs => input) and (outputs => output)
          // rt === schema of the activity
          if (activity.rt.input) {
            activity.rt.inputs = clone(activity.rt.input);
          }
          if (activity.rt.output) {
            activity.rt.outputs = clone(activity.rt.output);
          }
          return activity;
        })),
    ]).then(([triggers, activities]) => ({ triggers, activities }));
  },
};

function readFlogo(enginePath) {
  return readJSONFile(path.join(enginePath, 'flogo.json'));
}

function _readTasks(enginePath, type, data) {
  if (!data) {
    return Promise.resolve([]);
  }

  return Promise.all(data.map(function (taskInfo) {
      return readJSONFile(path.join(enginePath, TASK_SRC_ROOT, taskInfo.path, `${type}.json`))
      // rt means "runtime", the name was used to differentiate the ui descriptor versus the runtime descriptor,
      // now that the metadata is consolidated "rt" qualifier is not necessary anymore
      // todo: change "rt" to a more descriptive name
      .then(schema => Object.assign({}, taskInfo, { rt: schema }));
  }));
}

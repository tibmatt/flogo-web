const fs = require('fs');
const path = require('path');

import { readJSONFile } from '../../common/utils/file';
import groupBy from 'lodash/groupBy';

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
      _readTasks(enginePath, 'trigger', triggersToRead.map(refToPath)),
      _readTasks(enginePath, 'activity', activitiesToRead.map(refToPath)),
    ])
      .then(([triggers, activities]) => ({ triggers, activities }));
  }
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
      .then(schema => Object.assign({}, taskInfo, { rt: schema }));
  }));
}

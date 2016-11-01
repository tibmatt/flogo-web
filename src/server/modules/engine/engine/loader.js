var fs = require('fs');
var path = require('path');

const TASK_SRC_ROOT = 'vendor/src';
const DIR_NAME_UI = 'ui';

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
        _readTasks(enginePath, 'activity', data.activities)
      ]).then(function (result) {
        return {
          triggers: result[0],
          activities: result[1]
        };
      });
    });
  }
};

function readFlogo(enginePath) {
  return readJson(path.join(enginePath, 'flogo.json'));
}

function readJson(jsonPath) {
  return new Promise(function readPromise(resolve, reject) {
    fs.readFile(jsonPath, function readHandler(err, data) {
      if (err) {
        return reject(err);
      }

      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }

    });
  });
}

function _readTasks(enginePath, type, data) {
  if (!data) {
    return Promise.resolve([]);
  }

  return Promise.all(data.map(function (taskInfo) {
    return Promise.all([
      readJson(path.join(enginePath, TASK_SRC_ROOT, taskInfo.path, `${type}.json`)),
      readJson(path.join(enginePath, TASK_SRC_ROOT, taskInfo.path, DIR_NAME_UI, `${type}.json`))
    ])
    .then(schemas => Object.assign({}, taskInfo, {
      rt: schemas[0],
      ui: schemas[1]
    }));
  }));
}

import * as fs from 'fs';
import * as path from 'path';

import groupBy from 'lodash/groupBy';
import clone from 'lodash/clone';

import { readJSONFile, asyncIsDirectory } from '../../common/utils/file';

const TASK_SRC_ROOT_LEGACY = () => ['vendor', 'src'];
const TASK_SRC_ROOT = (engineName) => ['src', engineName, 'vendor'];

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
  readAllTasks(enginePath, taskData) {
    let taskDataPromise;
    if (!taskData) {
      taskDataPromise = readFlogo(enginePath);
    } else {
      taskDataPromise = Promise.resolve(taskData);
    }

    return Promise.all([
      taskDataPromise,
      determinePathToVendor(enginePath),
    ])
    .then(([data, vendorPath]) => {
      return Promise.all([
        _readTasks(vendorPath, 'trigger', data.triggers),
        _readTasks(vendorPath, 'activity', data.activities),
      ]);
    })
    .then(([triggers, activities]) => ({
      activities,
      triggers,
    }));
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

    return determinePathToVendor(enginePath)
      .then(vendorPath => {
        return Promise.all([
          _readTasks(vendorPath, 'trigger', triggersToRead.map(refToPath))
            .then(triggers => triggers.map(trigger => {
              // change to "old" name to support new definition without affecting the rest of the application
              // (outputs => output)
              // rt === schema of the trigger
              if (trigger.rt.output) {
                trigger.rt.outputs = clone(trigger.rt.output);
              }
              return trigger;
            })),
          _readTasks(vendorPath, 'activity', activitiesToRead.map(refToPath))
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
        ]);
      })
      .then(([triggers, activities]) => ({ triggers, activities }));
  },
};

function readFlogo(enginePath) {
  return readJSONFile(path.join(enginePath, 'flogo.json'));
}

function determinePathToVendor(enginePath) {
  const engineName = path.basename(enginePath);
  const relativeVendorPathParts = TASK_SRC_ROOT(engineName);
  const vendorPath = path.join(enginePath, ...relativeVendorPathParts);
  return asyncIsDirectory(vendorPath)
    .then(vendorDirExists => {
      console.log(`${vendorPath}?: `, vendorDirExists);
      if (vendorDirExists) {
        return vendorPath;
      }
      const legacyVendorDir = path.join(enginePath, ...TASK_SRC_ROOT_LEGACY());
      return asyncIsDirectory(legacyVendorDir).then(legacyVendorDirExists => {
        console.log(`${legacyVendorDir}?: `, vendorDirExists)
        if (!legacyVendorDirExists) {
          throw new Error('Could not find vendor directory while loading contributions');
        }
        return legacyVendorDir;
      });
    });
}

function _readTasks(vendorPath, type, data) {
  if (!data) {
    return Promise.resolve([]);
  }

  return Promise.all(data.map(function (taskInfo) {
    return readJSONFile(path.join(vendorPath, taskInfo.path, `${type}.json`))
      // rt means "runtime", the name was used to differentiate the ui descriptor versus the runtime descriptor,
      // now that the metadata is consolidated "rt" qualifier is not necessary anymore
      // todo: change "rt" to a more descriptive name
      .then(schema => Object.assign({}, taskInfo, { rt: schema }));
  }));
}

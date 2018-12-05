import * as fs from 'fs';
import * as path from 'path';

import groupBy from 'lodash/groupBy';

import { readJSONFile } from '../../common/utils/file';
import { normalizeContribSchema } from '../../common/contrib-schema-normalize';
import { determinePathToVendor } from './determine-path-to-vendor';

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
  readFlogo,
  readAllTasks(enginePath, taskData) {
    let taskDataPromise;
    if (!taskData) {
      taskDataPromise = readFlogo(enginePath);
    } else {
      taskDataPromise = Promise.resolve(taskData);
    }

    return Promise.all([taskDataPromise, determinePathToVendor(enginePath)])
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
          _readTasks(vendorPath, 'trigger', triggersToRead.map(refToPath)).then(
            triggers =>
              triggers.map(trigger => {
                // rt === schema of the trigger
                trigger.rt = normalizeContribSchema(trigger.rt);
                return trigger;
              })
          ),
          _readTasks(vendorPath, 'activity', activitiesToRead.map(refToPath)).then(
            activities =>
              activities.map(activity => {
                // rt === schema of the activity
                activity.rt = normalizeContribSchema(activity.rt);
                return activity;
              })
          ),
        ]);
      })
      .then(([triggers, activities]) => ({ triggers, activities }));
  },
};

function readFlogo(enginePath) {
  return readJSONFile(path.join(enginePath, 'flogo.json'));
}

function _readTasks(vendorPath, type, data) {
  if (!data) {
    return Promise.resolve([]);
  }

  return Promise.all(
    data.map(function(taskInfo) {
      return (
        readJSONFile(path.join(vendorPath, taskInfo.path, `${type}.json`))
          // rt means "runtime", the name was used to differentiate the ui descriptor versus the runtime descriptor,
          // now that the metadata is consolidated "rt" qualifier is not necessary anymore
          // todo: change "rt" to a more descriptive name
          .then(schema => Object.assign({}, taskInfo, { rt: schema }))
      );
    })
  );
}

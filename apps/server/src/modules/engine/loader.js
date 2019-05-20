import * as fs from 'fs';

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
    const refToPath = el => ({ path: el.path, ref: el.ref });

    return Promise.resolve(
      _readTasksNew(contributions.map(refToPath)).then(contribs =>
        contribs.map(contrib => {
          // rt === schema of the trigger
          contrib.rt = normalizeContribSchema(contrib.rt);
          return contrib;
        })
      )
    );
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

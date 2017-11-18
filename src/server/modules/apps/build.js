import { AppsManager } from './index.v2';
import { config } from './../../config/app-config';
import { writeJSONFile, rmFolder } from './../../common/utils';
import fs from 'fs';
import { getInitializedEngine } from './../../modules/init';


export function buildApp(appId, options) {
  let createdEngine = null;
  const buildOptions = Object.assign({}, { optimize: true, embedConfig: true }, options);
  const engineOptions = {
    forceCreate: true,
    defaultFlogoDescriptorPath: config.exportedAppBuild,
    vendor: config.defaultEngine.vendorPath,
  };

  return AppsManager.export(appId)
            .then((exportedApp) => {
              return writeJSONFile(config.exportedAppBuild, exportedApp)
                .then(() => {
                    return getInitializedEngine(config.appBuildEngine.path, engineOptions)
                      .then((engine) => {
                        createdEngine = engine;
                        return createdEngine.build(buildOptions);
                      })
                    .then((buildResult) => {
                      return new Promise((resolve, reject) => {
                        fs.readFile(buildResult.path, (err, data) => {
                           if(err) {
                             reject(err);
                           }
                           let binaryStream = data;
                           return createdEngine.remove()
                             .then(() => {
                               resolve({ appName: exportedApp.name, data: binaryStream });
                             });
                        });
                      });
                    })
                })
            });

}

import { ContribsManager } from '../contribs';
import { config } from '../../config/app-config';
import { readJSONFile } from '../../common/utils/file';
import { logger } from '../../common/logging';


export function installDeviceContributions() {
  return readJSONFile(config.defaultContribsPath)
    .then((content) => {
      const urls = (content || []).map((item)=> item.ref);
      return ContribsManager.install(urls)
        .then((results) => {
          logger.info(`Installing contributions`);
          logger.info(results);
          return results;
        });
  })
}

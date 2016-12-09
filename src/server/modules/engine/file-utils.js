import {fileExists, rmFolder} from '../../common/utils/file';

export function removeDir(dirpath) {
  if(fileExists(dirpath)) {
    return rmFolder(dirpath);
  } else {
    return Promise.resolve(true);
  }
}

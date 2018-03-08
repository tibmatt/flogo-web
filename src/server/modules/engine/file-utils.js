import fse from 'fs-extra';
import { join as pathJoin } from 'path';
import { fileExists, rmFolder, asyncIsDirectory as isDirectory } from '../../common/utils/file';

export function removeDir(dirpath) {
  if (fileExists(dirpath)) {
    return rmFolder(dirpath);
  } else {
    return Promise.resolve(true);
  }
}

export async function recursivelyFindFirstFile(dirPath) {
  const [childFile] = await fse.readdir(dirPath);
  if (!childFile) {
    throw new Error(`${dirPath} is empty`);
  }

  let resultPath = pathJoin(dirPath, childFile);
  const isChildFileADirectory = await isDirectory(resultPath);
  if (isChildFileADirectory) {
    resultPath = await recursivelyFindFirstFile(resultPath);
  }
  return resultPath;
}

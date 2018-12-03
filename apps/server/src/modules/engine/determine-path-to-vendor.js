import { basename, join as pathJoin } from 'path';
import { asyncIsDirectory } from '../../common/utils';

const TASK_SRC_ROOT_LEGACY = () => ['vendor', 'src'];
const TASK_SRC_ROOT = engineName => ['src', engineName, 'vendor'];

export function determinePathToVendor(enginePath) {
  const engineName = basename(enginePath);
  const relativeVendorPathParts = TASK_SRC_ROOT(engineName);
  const vendorPath = pathJoin(enginePath, ...relativeVendorPathParts);
  return asyncIsDirectory(vendorPath).then(vendorDirExists => {
    console.log(`${vendorPath}?: `, vendorDirExists);
    if (vendorDirExists) {
      return vendorPath;
    }
    const legacyVendorDir = pathJoin(enginePath, ...TASK_SRC_ROOT_LEGACY());
    return asyncIsDirectory(legacyVendorDir).then(legacyVendorDirExists => {
      console.log(`${legacyVendorDir}?: `, vendorDirExists);
      if (!legacyVendorDirExists) {
        throw new Error('Could not find vendor directory');
      }
      return legacyVendorDir;
    });
  });
}

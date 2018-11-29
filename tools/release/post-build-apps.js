import '../utils/crash-on-unhandled-rejection';
import { join as joinPath, resolve } from 'path';
import { writeFileSync, renameSync } from 'fs';
import readPkg from 'read-pkg';
import writePkg from 'write-pkg';
import { Sources, Dist, ABSOLUTE_DIST_SERVER_PATH } from './config';

(async () => {
  ensureExpectedBuildStructure();
  await updatePkgJson(Sources.root, Dist.server);
  writeFileSync(joinPath(Dist.server, '.env'), `FLOGO_WEB_LOCALDIR=${ABSOLUTE_DIST_SERVER_PATH}/local`);
})();

function ensureExpectedBuildStructure() {
  renameSync(resolve(Dist.root, 'apps'), resolve(Dist.root, 'build'));
  renameSync(resolve(Dist.root, 'build', 'client'), resolve(Dist.root, 'build', 'public'));
}

async function updatePkgJson(from, to) {
  const pkgJson = await readPkg({ cwd: from });
  pkgJson.version = process.env.FLOGO_LIB_VERSION || `dev-${pkgJson.version}`;
  pkgJson.scripts = {
    start: 'node main.js',
  };
  return writePkg(to, pkgJson);
}

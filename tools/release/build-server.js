import '../utils/crash-on-unhandled-rejection';
import { join as joinPath, resolve } from 'path';
import { writeFileSync } from 'fs';
import { buildSubmodule } from '../utils/build-submodule';
import { Sources, Dist, ABSOLUTE_DIST_SERVER_PATH } from './config';

const serverOutputDir = resolve(Dist.server);

(async () => {
  await buildSubmodule({
    submoduleName: 'server',
    submodulePath: Sources.server,
    buildCommand: 'build -- {1}',
    commandArgs: [ serverOutputDir ],
  });
  writeFileSync(joinPath(serverOutputDir, '.env'), `FLOGO_WEB_LOCALDIR=${ABSOLUTE_DIST_SERVER_PATH}/local`);
})();

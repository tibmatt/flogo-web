import gulp from 'gulp';
import { writeFileSync } from 'fs';
import { join as joinPath } from 'path';

import {CONFIG} from '../../config';

gulp.task('dist.version', function () {
  const version = getVersion();
  console.log(`Updating version number to: ${version}`);
  return writeFileSync(joinPath(CONFIG.paths.source.client, 'environments', 'version.ts'), `export const version = '${version}';\n`);
});

function getVersion() {
  const { BUILD_RELEASE_TAG: releaseTag, BUILD_GIT_COMMIT: gitCommit } = process.env;
  if (releaseTag) {
    return releaseTag;
  } else if (gitCommit) {
    return gitCommit.substring(0, 7);
  }
  return '';
}

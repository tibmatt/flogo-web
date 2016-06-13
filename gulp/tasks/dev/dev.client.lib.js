import path from 'path';

import gulp from 'gulp';
import del from 'del';
import vinyl from 'vinyl-fs';

import {CONFIG} from '../../config';

const DEPENDENCIES_DIRNAME = 'node_modules';

/**
 * Link third party libs to build folder
 */
gulp.task('dev.client.lib', () => {
  del.sync([path.join(CONFIG.paths.dist.public, DEPENDENCIES_DIRNAME)]);
  return vinyl.src(path.join(CONFIG.paths.source.client, DEPENDENCIES_DIRNAME), {followSymlinks: false})
    .pipe(vinyl.symlink(CONFIG.paths.dist.public));
});

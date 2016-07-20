import path from 'path';

import gulp from 'gulp';
import del from 'del';
import vinyl from 'vinyl-fs';

import {CONFIG} from '../../config';

const DEPENDENCIES_DIRNAME = 'node_modules';

/**
 * Link third party libs to build folder
 */
gulp.task('dev.server.lib', 'Link third party libs to build folder', () => {
  del.sync([path.join(CONFIG.paths.dist.server, DEPENDENCIES_DIRNAME)]);
  return vinyl.src(path.join(CONFIG.paths.source.server, DEPENDENCIES_DIRNAME), {followSymlinks: false})
    .pipe(vinyl.symlink(CONFIG.paths.dist.server));
});

import cp from 'child_process';
import path from 'path';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

import {CONFIG} from '../config';

/**
 * Starts db and server processes
 */
gulp.task('start', () => {

  // start db
  cp.spawn('npm', ['run', 'start-db'], {cwd: CONFIG.paths.dist.server, stdio: 'inherit'});

  // start server
  nodemon({
    // DO NOT use cwd option here, it will change the whole gulp process' cwd affecting other tasks
    exec: `npm --prefix="${CONFIG.paths.dist.server}" run start-server`,
    watch: CONFIG.paths.serverWatch.map(watchPath => path.join(CONFIG.paths.dist.server, watchPath))
  })
  .on('start', () => {
    process.env['FLOGO_SKIP_PKG_INSTALL'] = true;
  });

});

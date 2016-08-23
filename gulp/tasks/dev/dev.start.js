import cp from 'child_process';
import path from 'path';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

import {CONFIG} from '../../config';

/**
 * Starts the server for development
 */
gulp.task('dev.start', 'Starts server app and db for development', () => {

  cp.spawn('npm', ['run', 'start-db'], {cwd: CONFIG.paths.dist.server, stdio: 'inherit'});
  nodemon({
    verbose: true,
    // DON'T use cwd here, it will change the whole gulp process cwd
    exec: `npm --prefix="${CONFIG.paths.dist.server}" run start-dev-server`,
    watch: CONFIG.paths.serverWatch.map(watchPath => path.join(CONFIG.paths.dist.server, watchPath))
  })
  .on('start', () => {
    if(process.env['FLOGO_SKIP_PKG_INSTALL_ON_RESTART']) {
      process.env['FLOGO_SKIP_PKG_INSTALL'] = true;
    }
  });

  process.title = 'flogoweb';
  process.on('SIGINT', function() {
    setTimeout(function() {
      process.exit(1);
    }, 500);
  });

});

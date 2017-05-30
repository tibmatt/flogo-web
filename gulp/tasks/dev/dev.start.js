import path from 'path';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

import {CONFIG} from '../../config';

const FLOGO_WEB_READY = 'flogo-web::server::ready';
/**
 * Starts the server for development
 */
gulp.task('dev.start', 'Starts server app and db for development', [], () => {

  let npmTask = 'start-server';
  if (process.env['FLOGO_DEBUG']) {
    npmTask = 'start-debug';
  }

  nodemon({
    verbose: true,
    // DON'T use cwd here, it will change the whole gulp process cwd
    exec: `npm --prefix="${CONFIG.paths.dist.server}" run ${npmTask}`,
    watch: CONFIG.paths.serverWatch.map(watchPath => path.join(CONFIG.paths.dist.server, watchPath)),
    stdout: false
  })
    .on('stdout', function(stdout) {
      process.stdout.write(stdout);
      return;
    })
    .on('stderr', stderr => process.stderr.write(stderr));

  process.title = 'flogoweb';
  process.on('SIGINT', function () {
    setTimeout(function () {
      process.exit(1);
    }, 500);
  });

});

import cp from 'child_process';
import path from 'path';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

import {CONFIG} from '../../config';

/**
 *
 */
gulp.task('dist.build-engines', 'Starts server app and db in production mode', [], cb => {

  let db = cp.spawn('npm', ['run', 'start-db'], {cwd: CONFIG.paths.dist.server, stdio: 'inherit'});

  setTimeout(() => {
    console.log('Starting server');
    let builder = cp.exec('node configure-engines.js', {cwd: CONFIG.paths.dist.server}, function (err, stdout, stderr) {
      console.log(stdout);
      console.error(stderr);
    });

    builder.stdout.on('data', function(data) {
      console.log(data.toString());
    });
    builder.stderr.on('data', function(data) {
      console.error(data.toString());
    });
    builder.on('close', function(code) {
      console.log(`Build exited with code ${code}`);
      db.kill();
      cb();
    });

  }, 5000);

});

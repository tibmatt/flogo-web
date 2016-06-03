import cp from 'child_process';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

import {CONFIG} from '../config';

gulp.task('dev.start', () => {

  cp.spawn('npm', ['run', 'start-db'], {cwd: CONFIG.paths.dist.server, stdio: 'inherit'});
  nodemon({
    cwd: CONFIG.paths.dist.server,
    exec: 'npm run start-server',
    ignore: ['log.txt', 'node_modules/*', 'test-engine/*', 'build-engine/*', 'packages/*', 'data/*']
  })

});

import cp from 'child_process';
import path from 'path';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

import {CONFIG} from '../config';

gulp.task('start', () => {

  cp.spawn('npm', ['run', 'start-db'], {cwd: CONFIG.paths.dist.server, stdio: 'inherit'});
  nodemon({
    // DON'T use cwd here, it will change the whole gulp process cwd
    exec: `npm --prefix="${CONFIG.paths.dist.server}" run start-server`,
    watch: CONFIG.paths.serverWatch.map(watchPath => path.join(CONFIG.paths.dist.server, watchPath))
  });

});

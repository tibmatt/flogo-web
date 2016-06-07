import cp from 'child_process';
import path from 'path';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

import {CONFIG} from '../../config';

const serverIgnore = ['log.txt', 'node_modules', 'test-engine', 'build-engine', 'packages', 'data'];

gulp.task('dev.start', () => {

  cp.spawn('npm', ['run', 'start-db'], {cwd: CONFIG.paths.dist.server, stdio: 'inherit'});
  nodemon({
    // DON'T use cwd here, it will change the whole gulp process cwd
    exec: `npm --prefix="${CONFIG.paths.dist.server}" run start-server`,
    watch: [CONFIG.paths.dist.server],
    ignore: serverIgnore.map(ignorePath => path.join(CONFIG.paths.dist.server, ignorePath))
  });

});

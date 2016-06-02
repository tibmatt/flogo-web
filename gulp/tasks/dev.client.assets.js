import gulp from 'gulp';
import {CONFIG} from '../config';


gulp.task('dev.client.assets', [], ()=> {
  return gulp.src(['**/*', "!**/*.ts", "!**/*.js", "!**/*.css", "!**/*.less", "!**/*.js.map", "!**/node_modules/**"], {cwd: CONFIG.paths.source.client})
    .pipe(gulp.dest(CONFIG.paths.dist.public))
});



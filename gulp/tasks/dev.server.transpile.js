import gulp from 'gulp';
import {CONFIG} from '../config';
import path from 'path';

var babel = require('gulp-babel');


gulp.task('dev.server.transpile', [], (cb)=> {
  var src = path.join(CONFIG.paths.source.server,'**/*.js');
  console.log(src);

  return gulp.src(src)
            .pipe(babel({
              presets: ['es2015'],
              plugins: ['transform-runtime']
            }))
            .pipe(gulp.dest(CONFIG.paths.dist.server));
});

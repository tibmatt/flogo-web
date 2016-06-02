import gulp from 'gulp';
import path from 'path';
var ts = require('gulp-typescript');
import {CONFIG} from '../config';

gulp.task('dev.client.typescript', [], ()=> {

  let _tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
  });

  return gulp.src(["../../typings/browser.d.ts", "**/*.ts", "**/*.spec.ts", "!**/*.e2e.ts", "!node_modules/**/*.ts"], {cwd: CONFIG.paths.source.client})
    .pipe(ts(_tsProject))
    .pipe(gulp.dest(CONFIG.paths.dist.public));
});


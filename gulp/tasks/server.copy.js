import gulp from 'gulp';
import changed from 'gulp-changed';
import { copyParserFiles } from '../utils/copy-parser-files';
import {CONFIG} from '../config';

gulp.task('server.copy.assets', 'Copies server app files to dist folder', () => {
  return gulp.src(["**/*", '!**/*.js', "package.json", "yarn.lock", "!**/node_modules/**"], {cwd: CONFIG.paths.source.server, followSymlinks: false})
    .pipe(changed(CONFIG.paths.dist.server))
    .pipe(gulp.dest(CONFIG.paths.dist.server));
});

gulp.task('server.copy.parser', 'Copies parser files to dist', () => {
  return copyParserFiles(CONFIG.paths.dist.server);
});



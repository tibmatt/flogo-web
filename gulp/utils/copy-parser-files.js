import gulp from 'gulp';
import { join } from "path";
import { CONFIG } from '../config';
import changed from 'gulp-changed';

export function copyParserFiles(destination) {
  const parserDest = join(destination, 'node_modules', 'flogo-parser');
  return gulp.src(CONFIG.paths.parserSrc, {cwd: CONFIG.paths.source.parser, base: CONFIG.paths.source.parser})
    .pipe(changed(parserDest))
    .pipe(gulp.dest(parserDest));
}

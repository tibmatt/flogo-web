import { join as pathJoin } from 'path';
import gulp from 'gulp';
import runSequence from 'run-sequence';
import { CONFIG } from '../../config';
import { runSync } from '../../utils/npm-run';
import { copyParserFiles } from '../../utils/copy-parser-files';

gulp.task('dist.parser', 'Copies parser files to dist', (cb) => {
  return runSequence(
    'dist.parser.copy',
    'dist.parser.install',
    cb,
  );
});

gulp.task('dist.parser.copy', 'Copies parser files to dist', () => {
  return copyParserFiles(CONFIG.paths.dist.root);
});

gulp.task('dist.parser.install', 'Copies parser files to dist', () => {
  return runSync(`install --production`, pathJoin(CONFIG.paths.dist.root, 'node_modules', 'flogo-parser'));
});

import gulp from 'gulp';
import { runSync  } from '../../utils/npm-run';

gulp.task('dist.submodules-link', 'Copies parser files to dist', () => {
  return runSync('submodules:link');
});

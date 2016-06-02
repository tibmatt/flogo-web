import gulp from 'gulp';

gulp.task('dev.build', [
  'dev.buildSource',
  'dev.vendors',
  'dev.styles',
  'dev.assets'
]);

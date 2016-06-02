import gulp from 'gulp';

gulp.task('prod.build', [
  'dev.buildSource',
  'dev.vendors',
  'dev.styles',
  'dev.assets'
]);

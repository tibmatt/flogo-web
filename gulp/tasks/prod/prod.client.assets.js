import gulp from 'gulp';

import {CONFIG} from '../../config';

gulp.task('prod.client.assets', [], ()=> {
  let dest = CONFIG.paths.dist.public;
  return gulp.src(CONFIG.paths.distAssets, {cwd: CONFIG.paths.source.client, nodir: true})
    .pipe(gulp.dest(dest))
});



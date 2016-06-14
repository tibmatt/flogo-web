import gulp from 'gulp';

import {CONFIG} from '../../config';

/**
 * Copies client assets to build folder (like images)
 */
gulp.task('prod.client.assets', 'Copies client assets to build folder (like images)', [], ()=> {
  let dest = CONFIG.paths.dist.public;
  return gulp.src(CONFIG.paths.distAssets, {cwd: CONFIG.paths.source.client, nodir: true})
    .pipe(gulp.dest(dest))
});



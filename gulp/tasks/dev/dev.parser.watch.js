import gulp from 'gulp';
import {CONFIG} from '../../config';

/**
 * Watch server sources and execute the dev tasks when they change
 */
gulp.task('dev.server.watch.parser', 'Watch server sources and execute the dev tasks when they change', () => {
  gulp.watch(CONFIG.paths.parserSrc, {cwd: CONFIG.paths.source.parser}, ['server.copy.parser']);
});

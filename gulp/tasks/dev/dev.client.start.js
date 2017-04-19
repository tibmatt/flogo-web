import gulp from 'gulp';
import { npmRun }  from '../../utils/npm-run';

import {CONFIG} from '../../config';

/**
 * Run only client tasks
 */
gulp.task('dev.client.start', 'Start client', cb => npmRun('ng', {
 scriptArgs: ['serve'],
 cwd: CONFIG.paths.source.client,
 }));


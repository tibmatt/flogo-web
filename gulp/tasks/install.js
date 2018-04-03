import gulp from 'gulp';
import {CONFIG} from '../config';
import { runSync as npmRunSync } from '../utils/npm-run';

const install = npmRunSync.bind(null, 'install');

gulp.task('install.parser', 'Install parser dependencies', () => {
  npmRunSync('installbuild', CONFIG.paths.source.parser);
});

/**
 * Install client dependencies
 */
gulp.task('install.client.dev', 'Install client dependencies', () =>{
  return install(CONFIG.paths.source.client);
});

/**
 * Install client dependencies
 */
gulp.task('install.client.dist', 'Install client dist dependencies', () =>{
  return install(CONFIG.paths.dist.public);
});

/**
 * Install server dependencies
 */
gulp.task('install.server.dev', 'Install server dependencies', () => {
  return install(CONFIG.paths.source.server);
});

/**
 * Install server dependencies
 */
gulp.task('install.server.dist', 'Install server dist dependencies', () => {
  return install(CONFIG.paths.dist.server);
});

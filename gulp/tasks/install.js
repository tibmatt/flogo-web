import gulp from 'gulp';
import cp from 'child_process';
import {CONFIG} from '../config';

/**
 * Install client dependencies
 */
gulp.task('install.client.dev', 'Install client dependencies', () =>{
  return cp.execSync('npm install', {cwd: CONFIG.paths.source.client});
});

/**
 * Install client dependencies
 */
gulp.task('install.client.dist', 'Install client dependencies', () =>{
  return cp.execSync('npm install', {cwd: CONFIG.paths.dist.public});
});

/**
 * Install server dependencies
 */
gulp.task('install.server.dev', 'Install server dependencies', () => {
  return cp.execSync('npm install', {cwd: CONFIG.paths.source.server});
});

/**
 * Install server dependencies
 */
gulp.task('install.server.dist', 'Install server dependencies', () => {
  return cp.execSync('npm install', {cwd: CONFIG.paths.dist.server});
});

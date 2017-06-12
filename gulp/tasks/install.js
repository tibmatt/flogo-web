import gulp from 'gulp';
import cp from 'child_process';
import {CONFIG} from '../config';

const command = process.env.FGWEB_USE_YARN ? 'yarn' : 'npm';
function install(cwd) {
  return cp.execSync(`${command} install`, { cwd, stdio: 'inherit' });
}

/**
 * Install client dependencies
 */
gulp.task('install.client.dev', 'Install client dependencies', () =>{
  return install(CONFIG.paths.source.client);
});

/**
 * Install client dependencies
 */
gulp.task('install.client.dist', 'Install client dependencies', () =>{
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
gulp.task('install.server.dist', 'Install server dependencies', () => {
  return install(CONFIG.paths.dist.server);
});

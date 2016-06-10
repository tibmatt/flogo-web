import gulp from 'gulp';
import cp from "child_process";
import {CONFIG} from '../config';

/**
 * Install project dependencies
 */
gulp.task("install", ['install.client', 'install.server'], ()=>{
});

/**
 * Install client dependencies
 */
gulp.task("install.client", ()=>{
  return cp.execSync("npm install", {cwd: CONFIG.paths.source.client});
});

/**
 * Install server dependencies
 */
gulp.task("install.server", ()=> {
  return cp.execSync("npm install", {cwd: CONFIG.paths.dist.server});
});

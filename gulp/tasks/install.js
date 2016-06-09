import gulp from 'gulp';
import cp from "child_process";
import {CONFIG} from '../config';

gulp.task("install", ['install.client', 'install.server'], ()=>{
});

gulp.task("install.client", ()=>{
  return cp.execSync("npm install", {cwd: CONFIG.paths.source.client});
});

gulp.task("install.server", ()=> {
  return cp.execSync("npm install", {cwd: CONFIG.paths.dist.server});
});

import gulp from 'gulp';
import cp from "child_process";
import {CONFIG} from '../../config';

gulp.task("dev.install", ['dev.client.install', 'dev.server.install'], ()=>{
});

gulp.task("dev.client.install", ()=>{
  return cp.execSync("npm install", {cwd: CONFIG.paths.source.client});
});

gulp.task("dev.server.install", ()=> {
  return cp.execSync("npm install", {cwd: CONFIG.paths.dist.server});
});

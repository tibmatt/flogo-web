import gulp from 'gulp';
import path from 'path';
import runSequence from 'run-sequence';
import gulpLoadPlugins from 'gulp-load-plugins';

//CONFIG
let CONFIG = {
};
// source code folder
CONFIG.source='src';
// client source code
CONFIG.client=path.join(CONFIG.source, 'client');
// server source code
CONFIG.server=path.join(CONFIG.source, 'server');
// generate dist folder
CONFIG.dist= 'dist';
CONFIG.public=path.join(CONFIG.dist, 'public');

gulp.task("default", ()=>{
  runSequence(
    ["copy"]
  )
});

// Copy files
gulp.task("copy", ["copy:client", "copy:server"], ()=>{

});

gulp.task("copy:client", ()=>{
  gulp.src(['**/*.html'], {cwd: CONFIG.client})
    .pipe(gulp.dest(CONFIG.public))
});

gulp.task("copy:server", ()=>{
  gulp.src(["**/*", "package.json", ".babelrc"], {cwd: CONFIG.server})
    .pipe(gulp.dest(CONFIG.dist))
});
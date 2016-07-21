import cp from 'child_process';

import gulp from 'gulp';

import {CONFIG} from '../../config';

/**
 *
 */
gulp.task('dist.build-engines', 'Starts server app and db in production mode', [], cb => {

  let db = cp.spawn('npm', ['run', 'start-db'], {cwd: CONFIG.paths.dist.server, stdio: 'inherit'});

  setTimeout(() => {
    console.log('Starting server');
    promisifiedExec('node configure-engines.js', {cwd: CONFIG.paths.dist.server})
      .then(code => {
        console.log(`Build exited with code ${code}`);
        return promisifiedExec('npm run dump-db', {cwd: CONFIG.paths.dist.server});
      })
      .then(code => {
        console.log(`Dump exited with code ${code}`);
        
        console.log('Stopping db process');
        db.kill('SIGINT');

        console.log('dist.build-engines Finished');
        cb();
      });


  }, 5000);

});

function promisifiedExec(command, options) {
  return new Promise((resolve, reject) => {
    let child = cp.exec(command, options, function (err, stdout, stderr) {
      console.log(stdout);
      console.error(stderr);
    });

    child.stdout.on('data', function (data) {
      console.log(data.toString());
    });
    child.stderr.on('data', function (data) {
      console.error(data.toString());
    });

    child.on('close', function (code) {
      resolve(code);
    });

  });
}

import cp from 'child_process';
import http from 'http';

import gulp from 'gulp';

import {CONFIG} from '../../config';

/**
 *
 */
gulp.task('dist.build-engines', 'Starts server app and db in production mode', [], cb => {
  // let db = new DB();
  // db.start()
  //   .then(() => {
      console.log('Starting server');
  //    return
  promisifiedExec('node configure-engines.js', {cwd: CONFIG.paths.dist.server})//;
    // })
    // .then(code => {
    //   console.log(`Build exited with code ${code}`);
    //   return promisifiedExec('npm run dump-db', {cwd: CONFIG.paths.dist.server});
    // })
    .then(code => {
      //console.log(`DB dump exited with code ${code}`);

      // console.log('Stopping db process');
      // db.stop();

      console.log('dist.build-engines Finished');
      cb();

    })
    .catch(e => cb(e));

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

function DB() {
  var dbProcess = null;

  return {
    start() {
      return new Promise((resolve, reject) => {
        if (dbProcess) {
          return resolve(dbProcess);
        }

        //let timeout = setTimeout(() => reject(new Error('DB process start timed out')), 10000);
        dbProcess = cp.spawn('npm', ['run', 'start-db'], {
          cwd: CONFIG.paths.dist.server,
          detached: true,
          stdio: 'pipe'
        });

        dbProcess.stdout.on('data', function (data) {
          console.log('[DB Output:]', data.toString());
        });

        let pingAttempt = 1;
        let MAX_ATTEMPTS = 10;
        (function attemptToPingDb() {
          console.log('Waiting for DB: ' + pingAttempt);
          pingDb()
            .then(r => {
              console.log('DB reached, response: ', r);
              resolve(dbProcess)
            })
            .catch(e => {
              console.log(`Db reach attempt ${pingAttempt} failed`);
              pingAttempt++;
              if(pingAttempt < MAX_ATTEMPTS) {
                setTimeout(() => attemptToPingDb(), 5000);
              } else {
                reject(new Error('DB process start timed out'));
              }
            });
        })();

      });

    },
    stop() {
      if (dbProcess) {
        process.kill(-dbProcess.pid);
      }
    }
  };

}

function pingDb() {

  return new Promise((resolve, reject) => {
    //todo inject host/port
    http.get('http://127.0.0.1:5984/_all_dbs', response => {
      var body = '';
      response.on('data', function(d) {
          body += d;
      });
      response.on('end', function() {
          // Data reception is done, do whatever with it!
          //var parsed = JSON.parse(body);
          resolve(body);
      });
    }).on('error', (e) => {
      reject(e);
    });
  });

}

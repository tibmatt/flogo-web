import path from 'path';

const source = 'src';
const dist = 'dist';

export const CONFIG = {
  host: 'localhost:3010',
  paths: {
    source: {
      root: source,
      client: path.join(source, 'client'),
      server: path.join(source, 'server'),
      packages: path.join(source, 'packages')
    },
    dist: {
      root: dist,
      public: path.join(dist, 'public'),
      server: path.join(dist, 'server'),
      packages: path.join(dist, 'packages')
    },
    ts: ['../../typings/browser.d.ts', '**/*.ts', '**/*.spec.ts', '!**/*.e2e.ts', '!node_modules/**/*.ts'],
    less: ['{assets,app,common}/**/*.less'],
    assets: ['**/*', '!**/*.ts', '!**/*.js', '!**/*.less', '!**/*.js.map', '!**/node_modules/**'],
    serverSrc: ['**/*', 'package.json', '!**/node_modules/**'],
    distAssets: ['**/*', '!{app,common}/**/*.html', '!**/*.ts', '!**/*.js', '!**/*.less', '!**/*.js.map', '!**/node_modules/**'],
    distLess: ['assets/**/*.less', '!{app,common}/**/*.less'],
    // directories that should be watched by running server so it restarts if something changes
    serverWatch: ['api', 'common', 'config', 'modules', 'server.js']
  },
  libs: {
    js: [
      'node_modules/es6-shim/es6-shim.js',
      'node_modules/es6-promise/dist/es6-promise.js',
      'node_modules/reflect-metadata/Reflect.js',

      'node_modules/systemjs/dist/system-polyfills.src.js',
      'node_modules/systemjs/dist/system.src.js',

      // needs to be loaded after es6-shim and es6-promise
      'node_modules/zone.js/dist/zone.js',

      'node_modules/jquery/dist/jquery.js',
      'node_modules/d3/d3.js',
      'node_modules/lodash/lodash.js',
      'node_modules/postal/lib/postal.js',
      'node_modules/pouchdb/dist/pouchdb.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/moment/min/moment-with-locales.min.js',

      'node_modules/rxjs/bundles/Rx.js',
      'node_modules/ng2-bs3-modal/bundles/ng2-bs3-modal.min.js',

      'dev.env.js',
      'systemjs.config.js'
    ],
    // these won't be injected into html page but they need to be in client dist folder to be loaded by systemjs
    bundles: [
      'node_modules/@angular/common/common.umd.js',
      'node_modules/@angular/compiler/compiler.umd.js',
      'node_modules/@angular/core/core.umd.js',
      'node_modules/@angular/http/http.umd.js',
      'node_modules/@angular/platform-browser/platform-browser.umd.js',
      'node_modules/@angular/platform-browser-dynamic/platform-browser-dynamic.umd.js',
      'node_modules/@angular/router/router.umd.js',
      'node_modules/@angular/router-deprecated/router-deprecated.umd.js'
    ],
    styles: [
      'node_modules/bootstrap/dist/css/**/*',
      'node_modules/bootstrap/dist/fonts/**/*'
    ],
    dist: {
      vendors: [
        'node_modules/es6-shim/es6-shim.min.js',
        'node_modules/es6-promise/dist/es6-promise.min.js',
        'node_modules/reflect-metadata/Reflect.js',

        // Not required as we're building self-executing bundles
        // 'node_modules/systemjs/dist/system-polyfills.src.js',
        // 'node_modules/systemjs/dist/system.src.js',

        // needs to be loaded after es6-shim and es6-promise
        'node_modules/zone.js/dist/zone.min.js',

        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/d3/d3.min.js',
        'node_modules/lodash/lodash.min.js',
        'node_modules/postal/lib/postal.min.js',
        'node_modules/pouchdb/dist/pouchdb.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/moment/min/moment-with-locales.min.js'
      ],
      js: [
        'js/lib.bundle.js',
        'app.bundle.js'
      ]
    }
  },
  bundles: {
    lib: 'lib.bundle.js',
    app: 'app.bundle.js'
  }


};

import path from 'path';

const source = 'src';
const dist = 'dist';

export const CONFIG = {
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
    distLess: ['assets/**/*.less', '!{app,common}/**/*.less']
  },
  libs: {
    js: [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/d3/d3.js',
      'node_modules/lodash/lodash.js',
      'node_modules/systemjs/dist/system-polyfills.src.js',
      'node_modules/reflect-metadata/Reflect.js',
      'node_modules/es6-shim/es6-shim.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/angular2/bundles/angular2-polyfills.js',
      'node_modules/rxjs/bundles/Rx.js',
      'node_modules/angular2/bundles/angular2.js',
      'node_modules/angular2/bundles/router.js',
      'node_modules/angular2/bundles/http.js',
      'node_modules/postal/lib/postal.js',
      'node_modules/pouchdb/dist/pouchdb.js',
      'node_modules/ng2-bs3-modal/bundles/ng2-bs3-modal.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/moment/min/moment-with-locales.min.js',
      'dev.env.js',
      'systemjs.config.js'
    ],
    styles: [
      'node_modules/bootstrap/dist/css/**/*',
      'node_modules/bootstrap/dist/fonts/**/*'
    ],
    dist: {
      vendors: [
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/d3/d3.min.js',
        'node_modules/lodash/lodash.min.js',
        'node_modules/systemjs/dist/system-polyfills.js',
        'node_modules/reflect-metadata/Reflect.js',
        'node_modules/es6-shim/es6-shim.min.js',
        'node_modules/systemjs/dist/system.js',
        'node_modules/angular2/bundles/angular2-polyfills.min.js',
        'node_modules/rxjs/bundles/Rx.js',
        'node_modules/angular2/bundles/angular2.js',
        'node_modules/angular2/bundles/router.min.js',
        'node_modules/angular2/bundles/http.min.js',
        'node_modules/postal/lib/postal.min.js',
        'node_modules/pouchdb/dist/pouchdb.js',
        'node_modules/ng2-bs3-modal/bundles/ng2-bs3-modal.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/moment/min/moment-with-locales.min.js',
        'systemjs.config.js'
      ],
      js: [
        'js/lib.bundle.js',
        'app/app.bundle.js'
      ]
    }
  },
  bundles: {
    lib: 'lib.bundle.js',
    app: 'app.bundle.js'
  }


};

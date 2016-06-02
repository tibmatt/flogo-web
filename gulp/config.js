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
    }
  },
  libs: {
    js: [
      'jquery/dist/jquery.js',
      'd3/d3.js',
      'lodash/lodash.js',
      'systemjs/dist/system-polyfills.src.js',
      'reflect-metadata/Reflect.js',
      'es6-shim/es6-shim.js',
      'systemjs/dist/system.src.js',
      'angular2/bundles/angular2-polyfills.js',
      'rxjs/bundles/Rx.js',
      'angular2/bundles/angular2.js',
      'angular2/bundles/router.js',
      'angular2/bundles/http.js',
      'postal/lib/postal.js',
      'pouchdb/dist/pouchdb.js',
      'ng2-bs3-modal/bundles/ng2-bs3-modal.min.js',
      'bootstrap/dist/js/bootstrap.js',
      'moment/min/moment-with-locales.min.js'
    ],
    styles: [
      'bootstrap/dist/css/**/*',
      'bootstrap/dist/fonts/**/*'
    ]
  }


};

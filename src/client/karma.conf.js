module.exports = function(config) {

  var appBase    = 'common/';      // transpiled app JS and map files
  var appSrcBase = 'common/';      // app source TS files
  var appAssets  = 'base/app/'; // component assets fetched by Angular's compiler

  // Testing helpers (optional) are conventionally in a folder called `testing`
  var testingBase    = 'testing/'; // transpiled test JS and map files
  var testingSrcBase = 'testing/'; // test source TS files

  config.set({
    basePath: '',
    frameworks: ['jasmine'],

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter')
    ],


    client: {
      builtPaths: [appBase, testingBase], // add more spec base paths as needed
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },

    customLaunchers: {
      // From the CLI. Not used here but interesting
      // chrome setup for travis CI using chromium
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    files: [
      // System.js for module loading
      'node_modules/systemjs/dist/system.src.js',

      // Polyfills
      'node_modules/core-js/client/shim.js',

      // todo: necessary?
      'node_modules/reflect-metadata/Reflect.js',

      // lodash
      'node_modules/lodash/lodash.js',

      // zone.js
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/proxy.js',
      'node_modules/zone.js/dist/sync-test.js',
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',

      // jquery
      'node_modules/jquery/dist/jquery.js',

      'node_modules/d3/d3.js',
      'node_modules/lodash/lodash.js',
      'node_modules/postal/lib/postal.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/moment/min/moment-with-locales.min.js',
      'node_modules/socket.io-client/socket.io.js',

      'node_modules/ng2-bs3-modal/bundles/ng2-bs3-modal.min.js',

      // RxJs
      { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
      { pattern: 'node_modules/rxjs/**/*.js.map', included: false, watched: false },

      // Paths loaded via module imports:
      // Angular itself
      { pattern: 'node_modules/@angular/**/*.js', included: false, watched: false },
      { pattern: 'node_modules/@angular/**/*.js.map', included: false, watched: false },

      // ng2-bs3-modal
      //{pattern: 'node_modules/ng2-bs3-modal/components/*.js', included: false, watched: false},
      //{pattern: 'node_modules/ng2-bs3-modal/directives/*.js', included: false, watched: false},
      //{pattern: 'node_modules/ng2-bs3-modal/ng2-bs3-modal.js', included: false, watched: false},

      // ng2-translate
      {pattern: 'node_modules/ng2-translate/ng2-translate.js', included: false, watched: false},
      {pattern: 'node_modules/ng2-translate/src/*.js', included: false, watched: false},

      { pattern: 'systemjs.config.test.js', included: false, watched: false },
      //{ pattern: 'systemjs.config.extras.js', included: false, watched: false },
      'karma-test-shim.js', // optionally extend SystemJS mapping e.g., with barrels

      //{ pattern: 'node_modules/_tmp/Rx.js', included: true, watched: false },

      // transpiled application & spec code paths loaded via module imports
      { pattern: appBase + '**/*.js', included: false, watched: true },
      { pattern: testingBase + '**/*.js', included: false, watched: true },
      // TODO: verify
      { pattern: 'main.js', included: false, watched: true },
      { pattern: '*(app|common)/**/**.js', included: false, watched: true },
      { pattern: '*(app|common)/**/**.js.map', included: false, watched: true },

      // Asset (HTML & CSS) paths loaded via Angular's component compiler
      // (these paths need to be rewritten, see proxies section)
      { pattern: appBase + '**/*.*(html|css)', included: false, watched: true },
      { pattern: appBase + '**/*.*(png|svg)', included: false, watched: true },

      // Paths for debugging with source maps in dev tools
      //{ pattern: appSrcBase + '**/*.ts', included: false, watched: false },
      //{ pattern: appBase + '**/*.js.map', included: false, watched: false },
      //{ pattern: testingSrcBase + '**/*.ts', included: false, watched: false },
      //{ pattern: testingBase + '**/*.js.map', included: false, watched: false}
    ],

    // Proxied base paths for loading assets
    proxies: {
      // required for component assets fetched by Angular's compiler
      "/app/": appAssets,
      "/common/": "/base/common/",
      "/assets/": "/base/assets/"
    },

    exclude: [
      'node_modules/@angular/**/*_spec.js',
      'common/services/rest-api-test.spec.js'
    ],
    preprocessors: {},
    reporters: ['progress', 'kjhtml'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  })
};

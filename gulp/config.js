import path from 'path';

const source = 'src';

const dist = process.env.DIST_BUILD ? 'dist/build' : 'dist';

const sourcePaths = {
  root: source,
  client: path.join(source, 'client'),
  server: path.join(source, 'server'),
  packages: path.join(source, 'packages')
};

export const CONFIG = {
  paths: {
    source: sourcePaths,
    dist: {
      root: dist,
      public: path.join(dist, 'public'),
      server: path.join(dist, 'server'),
      packages: path.join(dist, 'packages')
    },
    less: ['{assets,app,common}/**/*.less', '!{assets,app,common}/**/_*.less'],
    serverSrc: ['**/*', 'package.json', '!**/node_modules/**'],
    distAssets: ['**/*', '!{app,common}/**/*.html', '!**/*.ts', '!**/*.js', '!**/*.less', '!**/*.js.map', '!**/node_modules/**'],
    // directories that should be watched by running server so it restarts if something changes
    serverWatch: ['api', 'common', 'config', 'modules', 'server.js']
  },
  host: 'localhost:3303'
};

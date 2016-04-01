import path from 'path';

let config = {
  db: {
    url: 'http://localhost:5984/flogo-web',
    cacheTime: 1 * 24 * 60 * 60 * 1000 /* default caching time (0 days) for static files, calculated in milliseconds */
  },
  app: {
    basePath: '/v1/api',
    port: process.env.PORT || 3010,
    cacheTime: 7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) for static files, calculated in milliseconds */
  }
};

export {config};


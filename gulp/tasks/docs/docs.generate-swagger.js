import gulp from 'gulp'
import {CONFIG} from '../../config';
var swaggerJSDoc = require('swagger-jsdoc');
var fs = require('fs');

/**
 * Generate the Swagger file
 */
gulp.task('docs.generate-swagger', 'Generate Swagger file', cb => {
  var options = {
    swaggerDefinition: {
      info: {
        title: 'Flogo-Web API documentation', // Title
        version: '1.0.0', // Version
      },
      host: CONFIG.host,
      basePath: '/v1/api',
      schemes: [
        'http'
      ],
      consumes: [
        'application/json',
        'text/plain'
      ],
      produces: [
        'application/json',
        'text/plain'
      ]
    },
    apis: [
      CONFIG.paths.source.server + '/api/activities/index.js',
      CONFIG.paths.source.server + '/api/configuration/index.js',
      CONFIG.paths.source.server + '/api/engine/index.js',
      CONFIG.paths.source.server + '/api/flows/index.js',
      CONFIG.paths.source.server + '/api/flows.detail/index.js',
      CONFIG.paths.source.server + '/api/flows.run/index.js',
      CONFIG.paths.source.server + '/api/ping/index.js',
      CONFIG.paths.source.server + '/api/triggers/index.js',
    ], // Path to the API docs
  };

  var swaggerSpec = swaggerJSDoc(options);
  console.log("S W A G G E R   S P E C ");
  fs.writeFile(CONFIG.paths.source.server + '/flogo-web-swagger.json', JSON.stringify(swaggerSpec), 'utf8', err => cb(err));
});

'use strict';

var url = require('url');

module.exports = {

  buildFlogoBaseApiPath() {
    return url.format({
      protocol: process.env.FLOGO_PROTOCOL,
      hostname: process.env.FLOGO_HOSTNAME,
      port: process.env.FLOGO_PORT,
      pathname: process.env.FLOGO_API_PATH
    });
  },

  buildFlogoBaseUiPath(pathname) {
    return url.format({
      protocol: process.env.FLOGO_PROTOCOL,
      hostname: process.env.FLOGO_HOSTNAME,
      port: process.env.FLOGO_PORT,
      pathname: pathname || ''
    });
  }

};

'use strict';

var url = require('url');

module.exports = {

  buildFlogoBaseApiPath() {
    return url.format({
      protocol: process.env.FLOGO_PROTOCOL,
      hostname: process.env.FLOGO_HOSTNAME,
      port: process.env.FLOGO_PORT,
      pathname: process.env.FLOGO_PATH
    });
  },

  buildFlogoBaseUiPath(pathname) {
    if(process.env.FLOGO_PUBLIC_URLS) {
      return url.format({
        protocol: process.env.FLOGO_PUBLIC_PROTOCOL,
        hostname: process.env.FLOGO_PUBLIC_HOSTNAME,
        port: process.env.FLOGO_PUBLIC_PORT,
        pathname: pathname || ''
      });
    } else {
      return url.format({
        protocol: process.env.FLOGO_PROTOCOL,
        hostname: process.env.FLOGO_HOSTNAME,
        port: process.env.FLOGO_PORT,
        pathname: pathname || ''
      });
    }
  }

};

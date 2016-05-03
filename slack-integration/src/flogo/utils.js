'use strict';

var atob = require('atob');
var btoa = require('btoa');

module.exports = {
  flogoIDEncode,
  flogoIDDecode
};


// URL safe base64 decoding
// reference: https://gist.github.com/jhurliman/1250118
function flogoIDEncode(id) {
  return btoa(id)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// URL safe base64 decoding
// reference: https://gist.github.com/jhurliman/1250118
function flogoIDDecode(encodedId) {

  encodedId = encodedId.replace(/-/g, '+')
    .replace(/_/g, '/');

  while (encodedId.length % 4) {
    encodedId += '=';
  }

  return atob(encodedId);
}

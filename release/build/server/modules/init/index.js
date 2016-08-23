'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _installTasks = require('./install-tasks');

Object.keys(_installTasks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _installTasks[key];
    }
  });
});

var _loadTasks = require('./load-tasks');

Object.keys(_loadTasks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _loadTasks[key];
    }
  });
});
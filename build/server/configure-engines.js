'use strict';

var _init = require('./modules/init');

var _engine = require('./modules/engine');

(0, _init.installAndConfigureTasks)().then(function () {
  console.log("[log] init test engine done");
  return (0, _engine.getInitialisedTestEngine)();
}).then(function (testEngine) {
  console.log("[log] init test engine done");
  return (0, _engine.getInitialisedBuildEngine)();
});
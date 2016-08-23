'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RegisterTriggers = undefined;

var _pouchdb = require('pouchdb');

var _pouchdb2 = _interopRequireDefault(_pouchdb);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _npm = require('npm');

var _npm2 = _interopRequireDefault(_npm);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _db = require('../../common/db.service');

var _appConfig = require('../../config/app-config');

var _baseRegistered = require('../base-registered');

var _constants = require('../../common/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultOptions = {
  type: _constants.TYPE_TRIGGER,
  path: _constants.DEFAULT_PATH_TRIGGER,
  schemaJsonName: _constants.SCHEMA_FILE_NAME_TRIGGER
};

var RegisterTriggers = exports.RegisterTriggers = function (_BaseRegistered) {
  _inherits(RegisterTriggers, _BaseRegistered);

  function RegisterTriggers(dbName, options) {
    _classCallCheck(this, RegisterTriggers);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(RegisterTriggers).call(this, dbName, _lodash2.default.merge({}, defaultOptions, options || {})));
  }

  return RegisterTriggers;
}(_baseRegistered.BaseRegistered);
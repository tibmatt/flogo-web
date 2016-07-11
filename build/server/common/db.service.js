'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DBService = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _pouchdb = require('pouchdb');

var _pouchdb2 = _interopRequireDefault(_pouchdb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PREFIX_AUTO_GENERATE = 'auto-generate-id';
var FLOW = 'flows';
var DIAGRAM = 'diagram';
var DELIMITER = ":";
var DEFAULT_USER_ID = 'flogoweb-admin';

// TODO need to research how to implement private property and function on ES6

var DBService = exports.DBService = function () {
  function DBService(name, options) {
    _classCallCheck(this, DBService);

    console.log("DBService initial, name: ", name);
    this.options = options;
    this._db = this._initDB(name, options);
    this._sync = null;
  }

  _createClass(DBService, [{
    key: 'getIdentifier',
    value: function getIdentifier(identifier) {
      identifier && (identifier = identifier.toUpperCase());
      if (identifier == 'PREFIX_AUTO_GENERATE') {
        return PREFIX_AUTO_GENERATE;
      } else if (identifier == 'FLOW') {
        return FLOW;
      } else if (identifier == 'DIAGRAM') {
        return DIAGRAM;
      } else if (identifier == 'DELIMITER') {
        return DELIMITER;
      } else if (identifier == 'DEFAULT_USER_ID') {
        return DEFAULT_USER_ID;
      } else {
        return undefined;
      }
    }

    /**
     * generate a unique id
     */

  }, {
    key: 'generateID',
    value: function generateID(userID) {
      // if userID isn't passed, then use default 'flogoweb'
      if (!userID) {
        // TODO for now, is optional. When we implement user login, then this is required
        userID = DEFAULT_USER_ID;
      }
      var timestamp = new Date().toISOString();
      var random = Math.random();
      var id = '' + PREFIX_AUTO_GENERATE + DELIMITER + userID + DELIMITER + timestamp + DELIMITER + random;

      return id;
    }

    /**
     * generate an id of flow
     * @param {string} [userID] - the id of currently user.
     */

  }, {
    key: 'generateFlowID',
    value: function generateFlowID(userID) {
      // if userID isn't passed, then use default 'flogoweb'
      if (!userID) {
        // TODO for now, is optional. When we implement user login, then this is required
        userID = DEFAULT_USER_ID;
      }

      var timestamp = new Date().toISOString();
      var id = '' + FLOW + DELIMITER + userID + DELIMITER + timestamp;

      console.log("[info]flowID: ", id);
      return id;
    }

    /**
     * create a doc to db
     * @param {Object} doc
     */

  }, {
    key: 'create',
    value: function create(doc) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (!doc) reject("Please pass doc");

        if (!doc.$table) {
          console.error("[Error]doc.$table is required. You must pass. ", doc);
          reject("[Error]doc.$table is required.");
        }

        // if this doc don't have id, generate an id for it
        if (!doc._id) {
          doc._id = _this.generateID();
          console.log("[warning]We generate an id for you, but suggest you give a meaningful id to this document.");
        }

        if (!doc['created_at']) {
          doc['created_at'] = new Date().toISOString();
        }
        _this._db.put(doc).then(function (response) {
          console.log("response: ", response);
          resolve(response);
        }).catch(function (err) {
          console.error(err);
          reject(err);
        });
      });
    }

    /**
     * update a doc
     * @param {Object} doc
     */

  }, {
    key: 'update',
    value: function update(doc) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (!doc) reject("Please pass doc");

        // if this doc don't have id, generate an id for it
        if (!doc._id) {
          console.error("[Error] Your doc don't have a valid _id");
          reject("[Error] Your doc don't have a valid _id");
        }

        if (!doc._rev) {
          console.error("[Error] Your doc don't have valid _rev");
          reject("[Error] Your doc don't have valid _rev");
        }

        if (!doc.$table) {
          console.error("[Error]doc.$table is required. You must pass. ", doc);
          reject("[Error]doc.$table is required.");
        }

        if (!doc['updated_at']) {
          doc['updated_at'] = new Date().toISOString();
        }
        _this2._db.get(doc._id).then(function (dbDoc) {

          doc = _lodash2.default.cloneDeep(doc);
          delete doc['_rev'];
          _lodash2.default.assign(dbDoc, doc);

          return _this2._db.put(dbDoc).then(function (response) {
            console.log("response: ", response);
            resolve(response);
          }).catch(function (err) {
            console.error(err);
            reject(err);
          });
        });
      });
    }
  }, {
    key: 'allDocs',
    value: function allDocs(options) {
      var _this3 = this;

      var defaultOptions = {
        include_docs: true
      };
      return new Promise(function (resolve, reject) {
        var ops = _lodash2.default.merge({}, defaultOptions, options || {});
        _this3._db.allDocs(ops).then(function (response) {
          //console.log("[allDocs]response: ", response);
          var res = [];
          if (ops.include_docs) {
            var rows = response && response.rows || [];
            rows.forEach(function (item) {
              res.push(item && item.doc);
            });
          } else {
            res = response;
          }
          resolve(res);
        }).catch(function (err) {
          console.error(err);
          reject(err);
        });
      });
    }
    /**
     * remove doc. You can pass doc object or doc._id and doc._rev
     */

  }, {
    key: 'remove',
    value: function remove() {
      var _this4 = this;

      var parameters = arguments;
      return new Promise(function (resolve, reject) {
        var doc = void 0,
            docId = void 0,
            docRev = void 0;
        // user pass doc
        if (parameters.length == 1) {
          doc = parameters[0];
          if ((typeof doc === 'undefined' ? 'undefined' : _typeof(doc)) != "object") {
            console.error("[error]Please pass correct doc object");
            reject("[error]Please pass correct doc object");
          }
          _this4._db.remove(doc).then(function (response) {
            resolve(response);
          }).catch(function (err) {
            reject(err);
          });
        } else if (parameters.length > 1) {
          // remove by _id and _rev
          docId = parameters[0];
          docRev = parameters[1];

          if (!docId || !docRev) {
            console.error("[error]Please pass correct doc._id and doc._rev");
            reject("[error]Please pass correct doc._id and doc._rev");
          }

          _this4._db.remove(docId, docRev).then(function (response) {
            resolve(response);
          }).catch(function (err) {
            reject(err);
          });
        }
      });
    }
  }, {
    key: '_initDB',
    value: function _initDB(name, options) {
      var db = new _pouchdb2.default(name);
      // PouchDB will be initialled when you call it. So this code is to make sure db is created
      db.info().then(function (response) {
        console.log("[_initDB][response]", response);
      }).catch(function (error) {
        console.log("[_initDB][error]", error);
      });
      return db;
    }
  }, {
    key: 'db',
    get: function get() {
      return this._db;
    }
  }]);

  return DBService;
}();
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseRegistered = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _utils = require('../../common/utils');

var _appConfig = require('../../config/app-config');

var _constants = require('../../common/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var execSync = require('child_process').execSync;

var COMPONENT_TYPE = ["trigger", "activity", "model"];

// default options
var defaultOptions = {
  path: 'modules/base-registered',
  jsonTplName: 'package.tpl.json'
};

/**
 * Base class of registered
 */

var BaseRegistered = exports.BaseRegistered = function () {
  /**
   * constructor function
   * @param {string||DBService} dbName - db name or an instance of DBService. it can be local or remote db
   * @param {Object} options
   * @param {Object} options.type - currently registered type, it can be trigger, activity, model
   * @param {string} options.defaultPath - the default path that store activity or trigger or model develop by Flogo team
   * @param {Object} [options.defaultConfig] - by default, we will install it from local file system, but you can use this to overwrite. {'folder_name': 'path'}
   * @param {string} options.customPath - the custom path that store activity or trigger or model develop by contributor
   * @param {Object} [options.customConfig] - by default, we will install it from local file system, but you can use this to overwrite. {'folder_name': 'path'}
   * @param {string} [options.path='modules/base-registered'] - path relative to root folder.
   * @param {string} [options.jsonTplName='package.tpl.json'] - package.json template file name.
   * @param {string} options.schemaJsonName - The name of schema json
   */

  function BaseRegistered(dbName, options) {
    _classCallCheck(this, BaseRegistered);

    if (!dbName) {
      throw "dbName is required";
    }

    this._options = _lodash2.default.merge({}, defaultOptions, options);

    // store db information
    if (_lodash2.default.isString(dbName)) {
      this._dbService = new _db.DBService(dbName);
    } else if (_lodash2.default.isObject(dbName) && dbName instanceof _db.DBService) {
      this._dbService = dbName;
    } else {
      throw "dbName is required, and it should be a name of DB or an instance of DBService";
    }

    // folder store package.json
    this._packageJSONFolderPath = _path2.default.resolve(_appConfig.config.rootPath, this._options.path);
    // package.tpl.json path
    this._packageJSONTplFilePath = _path2.default.join(this._packageJSONFolderPath, this._options.jsonTplName);

    // read the package.json template, will use this template to generate package.json
    var data = _fs2.default.readFileSync(this._packageJSONTplFilePath, { "encoding": "utf8" });
    this.packageJSONTemplate = JSON.parse(data);

    // store the path of runtime(activity runtime, trigger runtime)
    this._where = [];
  }

  _createClass(BaseRegistered, [{
    key: 'register',
    value: function register() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.clean().then(function () {
          console.log("[Info]clean success!, type: ", _this._options.type);
          _this.updateDB().then(function () {
            resolve(true);
          }).catch(function (err) {
            reject(err);
          });
        }).catch(function (err) {
          console.error("[Error]clean fail!, type: ", _this._options.type);
          reject(err);
        });
      });
    }
  }, {
    key: 'watch',


    // watch the activities
    value: function watch() {
      var _this2 = this;

      this.updateActivitiesDB();
      // continue watch and also watch te sbudirectories
      var watchOptions = {
        persistent: true,
        recursive: true
      };

      // start watch the change in activities folder
      _fs2.default.watch(this.activitiesAbsolutePath, watchOptions, function (event, filename) {
        // console.log("========event: ", event);
        // console.log("========filename: ", filename);
        _this2.updateActivitiesDB();
      });
    }
  }, {
    key: 'clean',
    value: function clean() {
      var _this3 = this;

      //console.log("-------clean");
      return new Promise(function (resolve, reject) {
        _this3.cleanDB().then(function (result) {
          return _this3.cleanNodeModules();
        }).then(function (result) {
          resolve(true);
        }).catch(function (err) {
          reject(false);
        });
      });
    }
  }, {
    key: 'cleanDB',
    value: function cleanDB() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4._dbService.db.allDocs({ include_docs: true }).then(function (result) {
          console.log("[info]cleanDB, type: ", _this4._options.type);
          var docs = result && result.rows || [];
          var deletedDocs = [];

          if (docs.length === 0) {
            console.log("[success]cleanDB finished!, empty docs type: ", _this4._options.type);
            resolve(result);
          }

          docs.forEach(function (item) {
            //doc._deleted = true;
            var doc = item && item.doc;
            if (doc) {
              doc._deleted = true;
              deletedDocs.push(doc);
            }
            //console.log(doc);
          });

          //console.log(deletedDocs);
          _this4._dbService.db.bulkDocs(deletedDocs).then(function (result) {
            console.log("[success]cleanDB finished!, type: ", _this4._options.type);
            resolve(result);
          }).catch(function (err) {
            reject(err);
            console.error("[error]cleanDB error!, update docs error! type: ", _this4._options.type, err);
          });
        }).catch(function (err) {
          console.error("[error]cleanDB error!, get docs error! type: ", _this4._options.type, err);
          reject(err);
        });
      });
    }
  }, {
    key: 'cleanNodeModules',
    value: function cleanNodeModules() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        try {
          var nodeModulesPath = _path2.default.join(_this5._packageJSONFolderPath, 'node_modules');
          if ((0, _utils.isExisted)(nodeModulesPath)) {
            execSync('rm -rf ' + nodeModulesPath);
          }
          console.log("[Success]cleanNodeModules finished!, type: ", _this5._options.type);
          resolve(true);
        } catch (err) {
          console.error("[error]cleanNodeModules error!, type: ", _this5._options.type);
          reject(false);
        }
      });
    }

    /**
     *
     */

  }, {
    key: 'updatePackageJSON',
    value: function updatePackageJSON(dirPath, config, sourcePackageJSON) {
      var _this6 = this;

      console.log("[debug]updatePackageJSON");
      var packageJSON = _lodash2.default.cloneDeep(sourcePackageJSON);
      !packageJSON.dependencies ? packageJSON.dependencies = {} : null;
      // get all the activity package in activitiesPath
      if (dirPath) {
        var dirs = (0, _utils.readDirectoriesSync)(dirPath);
        //console.log(dirs);
        if (dirs && dirs.length) {
          // console.log("???????dirs", dirs);
          dirs.forEach(function (dir, index) {
            var itemPath = _path2.default.join(dirPath, dir);
            //console.log("itemPath: ", itemPath);

            var design_package_json = null;
            var value = null;

            // TODO need to improve, provide better way

            if ((0, _utils.isExisted)(_path2.default.join(itemPath, _constants.DEFAULT_SCHEMA_ROOT_FOLDER_NAME, 'package.json'))) {
              design_package_json = _path2.default.join(itemPath, _constants.DEFAULT_SCHEMA_ROOT_FOLDER_NAME, 'package.json');
              value = _path2.default.join(itemPath, _constants.DEFAULT_SCHEMA_ROOT_FOLDER_NAME);
            } else if ((0, _utils.isExisted)(_path2.default.join(itemPath, 'src', _constants.DEFAULT_SCHEMA_ROOT_FOLDER_NAME, 'package.json'))) {
              design_package_json = _path2.default.join(itemPath, 'src', _constants.DEFAULT_SCHEMA_ROOT_FOLDER_NAME, 'package.json');
              value = _path2.default.join(itemPath, 'src', _constants.DEFAULT_SCHEMA_ROOT_FOLDER_NAME);
            } else {
              console.log("[Warning] didn't find design time for this activity");
            }

            if (design_package_json) {
              var data = _fs2.default.readFileSync(design_package_json, { "encoding": "utf8" });
              var designPackageJSONData = JSON.parse(data);
              var type = designPackageJSONData.name;
              if (type) {
                packageJSON.dependencies[type] = _path2.default.join(value);
                var where = config[type] && config[type].path ? config[type].path : "file://" + itemPath;
                _this6._where[type] = where;
              }
            }
          });
          // console.log("++++++packageJSON: ", packageJSON);
        } else {
            //console.log("[info]updatePackageJSON. empty");
          }

        var JSONStr = JSON.stringify(packageJSON, null, 2);
        _fs2.default.writeFileSync(_path2.default.join(this._packageJSONFolderPath, 'package.json').toString(), JSONStr, { "encoding": "utf8" });
      }

      return packageJSON;
    }
  }, {
    key: 'updateDB',
    value: function updateDB() {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        console.log("[debug]updateDB");
        // update activity package.json
        var dependencies = void 0;
        if (!process.env['FLOGO_NO_ENGINE_RECREATION']) {
          var packageJSON = _lodash2.default.cloneDeep(_this7.packageJSONTemplate);
          packageJSON = _this7.updatePackageJSON(_this7._options.defaultPath, _this7._options.defaultConfig, packageJSON);
          packageJSON = _this7.updatePackageJSON(_this7._options.customPath, _this7._options.customConfig, packageJSON);
          // console.log(packageJSON);
          dependencies = packageJSON.dependencies;
        } else {
          var existingPackageJSON = JSON.parse(_fs2.default.readFileSync(_path2.default.join(_this7._packageJSONFolderPath, 'node_modules', key, 'package.json'), 'utf8'));
          dependencies = existingPackageJSON && existingPackageJSON.dependencies ? existingPackageJSON.dependencies : {};
        }

        // new activities generate from package.json
        var items = {};

        // install all activity packages
        _this7.install().then(function () {

          // generate all the activity docs
          _lodash2.default.forOwn(dependencies, function (value, key) {
            var packageJSON = JSON.parse(_fs2.default.readFileSync(_path2.default.join(_this7._packageJSONFolderPath, 'node_modules', key, 'package.json'), 'utf8'));
            var schemaJSON = JSON.parse(_fs2.default.readFileSync(_path2.default.join(_this7._packageJSONFolderPath, 'node_modules', key, _this7._options.schemaJsonName), 'utf8'));
            // console.log("packageJSON: ", packageJSON);
            // console.log("schemaJSON: ", schemaJSON);

            var id = BaseRegistered.generateID(key, packageJSON.version);
            console.log("id: ", id);

            items[id] = BaseRegistered.constructItem({
              'id': id,
              'where': _this7._where[key],
              'name': key,
              'version': packageJSON.version,
              'description': packageJSON.description,
              'keywords': packageJSON.keywords || [],
              'author': packageJSON.author,
              'schema': schemaJSON
            });
          });

          // console.log("!!!!!!!!activityDocs: ", activityDocs);

          BaseRegistered.saveItems(_this7.dbService, items).then(function (result) {
            console.log('[info] updateDB done.');
            return result;
          }).then(resolve).catch(reject);
        }).catch(function (err) {
          console.error("[error]Install error. ", err);
          reject(err);
        });
      });
    }

    /**
     * @callback npmLoadCallback
     * @params {Object} err - If has error, will pass error object back
     */
    /**
     * npm.load() must be called before any other function call. Create a common function for this
     * @param {npmLoadCallback} callback
     */

  }, {
    key: 'npmLoad',
    value: function npmLoad(callback) {
      _npm2.default.load({}, function (err) {
        if (err) throw new Error(err);
        callback();
      });
    }
  }, {
    key: 'install',
    value: function install() {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        _this8.npmLoad(function () {
          // Store current working directory
          var currentCWD = process.cwd();
          console.log("currentCWD: ", currentCWD);
          process.chdir(_this8._packageJSONFolderPath);
          _npm2.default.commands.install(_this8._packageJSONFolderPath, [], function (err, result) {
            // Change current working directory back
            process.chdir(currentCWD);
            if (err) {
              reject(err);
              console.log(err);
            } else {
              resolve(result);
              //console.log("success: ", result);
            }
          });
        });
      });
    }
  }, {
    key: 'dbService',
    get: function get() {
      return this._dbService;
    }
  }], [{
    key: 'generateID',
    value: function generateID(name, version) {
      // console.log("generateActivityID, arguments: ", arguments);
      name = _lodash2.default.kebabCase(name);
      // console.log("name: ", name);
      // TODO need to think about how to versionable activity
      version = _lodash2.default.kebabCase(version);
      // console.log("version: ", version);
      // let id = this.ACTIVITIES+this.DELIMITER+name+this.DELIMITER+version;
      var id = name;
      //console.log("generateID, id: ", id);
      return id;
    }
  }, {
    key: 'constructItem',
    value: function constructItem(opts) {
      return {
        _id: opts.id,
        'where': opts.where,
        'name': opts.name,
        'version': opts.version,
        'description': opts.description,
        'keywords': opts.keywords || [],
        'author': opts.author || 'Anonymous',
        'schema': opts.schema
      };
    }
  }, {
    key: 'saveItems',
    value: function saveItems(dbService, items, updateOnly) {
      var _items = _lodash2.default.cloneDeep(items); // in order to avoid the changes on the given items.

      // get all of the items in the given db
      return dbService.db.allDocs({ include_docs: true }).then(function (docs) {
        console.log('[info] Get all items.');
        return docs;
      })
      // pre-process the docs
      .then(function (docs) {
        console.log('[info] pre-process the docs');
        return _lodash2.default.map(docs.rows, function (row) {
          return row && row.doc || null;
        });
      }).then(function (itemDocs) {
        return _lodash2.default.filter(itemDocs, function (itemDoc) {
          return !_lodash2.default.isNull(itemDoc);
        });
      })

      // update or remove item
      // `updateOnly` will skip the `remove other items` part.
      .then(function (oldItems) {

        console.log('[info] update or remove item');

        return Promise.all(_lodash2.default.map(oldItems, function (oldItem) {

          var newItem = _items[oldItem['_id']];

          // if this item cannot be found in the activityDocs generated from package.json, then need to be removed
          if (!newItem) {
            if (updateOnly) {
              console.log('[info] ignore exist item [' + oldItem['where'] + '] for updating only.');
              return null;
            }
            return dbService.db.remove(oldItem).then(function (result) {
              console.log('[info] delete item [' + oldItem['where'] + '] success.');
              return result;
            }).catch(function (err) {
              console.error("[error] delete item fail.", err);
              throw err;
            });
          } else {
            // update the item.

            // When updating an item, the old one will be overwritten,
            // since the user maybe delete some value in the new one.

            // copy the some value from current activity in DB
            newItem['_id'] = oldItem['_id'];
            newItem['_rev'] = oldItem['_rev'];
            newItem.created_at = oldItem.created_at;
            newItem.updated_at = new Date().toISOString();

            // update this item in DB
            return dbService.db.put(_lodash2.default.cloneDeep(newItem)).then(function (response) {
              console.log('[info] Update item [' + newItem['where'] + '] success.');
              return response;
            }).then(function (result) {
              // delete this item from the given list.
              delete _items[oldItem['_id']];
              return result;
            }).catch(function (err) {
              console.log('[error] Update item [' + newItem['where'] + '] error: ', err);
              throw err;
            });
          }
        }));
      })
      // filter undefined && null
      .then(function () {
        return _lodash2.default.filter(_items, function (_item) {
          return !_lodash2.default.isNil(_items);
        });
      })

      // add new items
      .then(function (newItems) {
        console.log('[info] add new items');

        return Promise.all(_lodash2.default.map(newItems, function (newItem) {
          newItem.created_at = new Date().toISOString();

          return dbService.db.put(newItem).then(function (response) {
            console.log('[info] Add item [' + newItem['where'] + '] success.');
            return response;
          }).catch(function (err) {
            console.log('[error] Add item [' + newItem['where'] + '] error: ', err);
            throw err;
          });
        }));
      })

      // done with true
      .then(function () {
        return true;
      }).catch(function (err) {
        console.error('Error in saveItems:\n' + err);
        throw err;
      });
    }
  }]);

  return BaseRegistered;
}();
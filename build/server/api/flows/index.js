'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flows = flows;

var _appConfig = require('../../config/app-config');

var _db = require('../../common/db.service');

var _utils = require('../../common/utils');

var _constants = require('../../common/constants');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _flows = require('./flows.utils');

var flowUtils = _interopRequireWildcard(_flows);

var _fs = require('fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getFlows, createFlows, deleteFlows, addTrigger, addActivity, exportFlowInJsonById, importFlowFromJson].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;
var dbDefaultName = _appConfig.config.db;
var _dbService = _appConfig.dbService;
var FLOW = 'flows';
var DELIMITER = ":";
var DEFAULT_USER_ID = 'flogoweb-admin';

var ERROR_TRIGGER_NOT_FOUND = 'TRIGGER_NOT_FOUND';
var ERROR_ACTIVITY_NOT_FOUND = 'ACTIVITY_NOT_FOUND';
var ERROR_FLOW_NOT_FOUND = 'FLOW_NOT_FOUND';
var ERROR_MISSING_TRIGGER = 'MISSING_TRIGGER';
var ERROR_WRITING_DATABASE = 'ERROR_WRITING_DATABASE';
var ERROR_CODE_BADINPUT = 400;
var ERROR_CODE_SERVERERROR = 500;

function getAllFlows() {
  var options = {
    include_docs: true,
    startKey: '' + FLOW + DELIMITER + DEFAULT_USER_ID + DELIMITER,
    endKey: '' + FLOW + DELIMITER + DEFAULT_USER_ID + DELIMITER + '￿'
  };

  return new Promise(function (resolve, reject) {
    _dbService.db.allDocs(options).then(function (response) {
      var allFlows = [];
      var rows = response && response.rows || [];
      rows.forEach(function (item) {
        // if this item's tabel is FLOW
        if (item && item.doc && item.doc.$table === FLOW) {
          allFlows.push(item.doc);
        }
      });
      resolve(allFlows);
      // console.log(allFlows);
      //this.body = allFlows;
    }).catch(function (err) {
      reject(err);
    });
  });
}

/**
 *
 * @param query {name: string}
 * @returns {*}
 */
function filterFlows(query) {
  query = _lodash2.default.assign({}, query);

  var options = {
    include_docs: true,
    startKey: '' + FLOW + DELIMITER + DEFAULT_USER_ID + DELIMITER,
    endKey: '' + FLOW + DELIMITER + DEFAULT_USER_ID + DELIMITER + '￿',
    key: query.name
  };

  // TODO:  repplace with a persistent query: https://pouchdb.com/guides/queries.html
  return _dbService.db.query(function (doc, emit) {
    emit(doc.name);
  }, options).then(function (response) {
    var allFlows = [];
    var rows = response && response.rows || [];
    rows.forEach(function (item) {
      // if this item's tabel is FLOW
      if (item && item.doc && item.doc.$table === FLOW) {
        allFlows.push(item.doc);
      }
    });
    return allFlows;
  });
}

function createFlow(flowObj) {
  return new Promise(function (resolve, reject) {
    _dbService.create(flowObj).then(function (response) {
      resolve(response);
    }).catch(function (err) {
      reject(err);
    });
  });
}

function updateFlow(flowObj) {
  return new Promise(function (resolve, reject) {
    _dbService.update(flowObj).then(function (response) {
      resolve(response);
    }).catch(function (err) {
      reject(err);
    });
  });
}

function flows(app, router) {
  if (!app) {
    console.error("[Error][api/activities/index.js]You must pass app");
  }

  router.get(basePath + "/flows", getFlows);
  router.post(basePath + "/flows", createFlows);
  router.delete(basePath + "/flows", deleteFlows);

  // {
  //   name: "tibco-mqtt"
  // }
  router.post(basePath + "/flows/triggers", addTrigger);
  router.post(basePath + "/flows/activities", addActivity);

  router.post(basePath + '/flows/json', importFlowFromJson);
  router.get(basePath + '/flows/:id/json', exportFlowInJsonById);
}

function getFlows(next) {
  var data;
  return regeneratorRuntime.wrap(function getFlows$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("getFlows, next: ", next);
          //this.body = 'getFlows';

          data = [];

          if (_lodash2.default.isEmpty(this.query)) {
            _context.next = 8;
            break;
          }

          _context.next = 5;
          return filterFlows(this.query);

        case 5:
          data = _context.sent;
          _context.next = 11;
          break;

        case 8:
          _context.next = 10;
          return getAllFlows();

        case 10:
          data = _context.sent;

        case 11:
          //yield next;
          console.log(data);
          this.body = data;

        case 13:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function createFlows(next) {
  var data, flowObj, res, error;
  return regeneratorRuntime.wrap(function createFlows$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log("createFlows");
          _context2.prev = 1;
          data = this.request.body || {};

          if (typeof this.request.body == 'string') {
            if ((0, _utils.isJSON)(this.request.body)) {
              data = JSON.parse(this.request.body);
            }
          }
          flowObj = {};

          flowObj.name = data.name || "";
          flowObj.description = data.description || "";
          flowObj._id = _dbService.generateFlowID();
          flowObj.$table = _dbService.getIdentifier("FLOW");
          flowObj.paths = {};
          flowObj.items = {};
          console.log(flowObj);
          _context2.next = 14;
          return createFlow(flowObj);

        case 14:
          res = _context2.sent;

          this.body = res;
          _context2.next = 22;
          break;

        case 18:
          _context2.prev = 18;
          _context2.t0 = _context2['catch'](1);
          error = {
            code: 500,
            message: _context2.t0.message
          };

          this.body = error;

        case 22:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this, [[1, 18]]);
}

function deleteFlows(next) {
  return regeneratorRuntime.wrap(function deleteFlows$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log("deleteFlows");
          this.body = 'deleteFlows';
          _context3.next = 4;
          return next;

        case 4:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[2], this);
}

function addTrigger(next) {
  var response, params, trigger, flow, res;
  return regeneratorRuntime.wrap(function addTrigger$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          response = {};
          //TODO validate this query is json

          params = _lodash2.default.assign({}, { name: '', flowId: '' }, this.request.body || {}, this.query);
          _context4.next = 4;
          return _getTriggerByName(params.name);

        case 4:
          trigger = _context4.sent;

          if (!trigger) {
            this.throw(ERROR_CODE_BADINPUT, ERROR_TRIGGER_NOT_FOUND, { details: { type: ERROR_TRIGGER_NOT_FOUND, message: ERROR_TRIGGER_NOT_FOUND } });
          }

          _context4.next = 8;
          return _getFlowById(params.flowId);

        case 8:
          flow = _context4.sent;

          if (!flow) {
            this.throw(ERROR_CODE_BADINPUT, ERROR_FLOW_NOT_FOUND, { details: { type: ERROR_FLOW_NOT_FOUND, message: ERROR_FLOW_NOT_FOUND } });
          }

          trigger = _activitySchemaToTrigger(trigger.schema);
          flow = flowUtils.addTriggerToFlow(flow, trigger);

          _context4.next = 14;
          return updateFlow(flow);

        case 14:
          res = _context4.sent;


          if (res && res.ok && res.ok == true) {
            response.status = 200;
            response.id = res.id;
            response.name = flow.name || '';
          } else {
            this.throw(ERROR_CODE_SERVERERROR, ERROR_WRITING_DATABASE, { details: { type: ERROR_WRITING_DATABASE, message: ERROR_WRITING_DATABASE } });
          }

          this.body = response;

        case 17:
        case 'end':
          return _context4.stop();
      }
    }
  }, _marked[3], this);
}

function addActivity(next) {
  var response, params, activity, flow, res;
  return regeneratorRuntime.wrap(function addActivity$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          response = {};
          params = _lodash2.default.assign({}, { name: '', flowId: '' }, this.request.body || {}, this.query);
          _context5.next = 4;
          return _getActivityByName(params.name);

        case 4:
          activity = _context5.sent;

          if (!activity) {
            this.throw(ERROR_CODE_BADINPUT, ERROR_ACTIVITY_NOT_FOUND, { details: { type: ERROR_ACTIVITY_NOT_FOUND, message: ERROR_ACTIVITY_NOT_FOUND } });
          };

          _context5.next = 9;
          return _getFlowById(params.flowId);

        case 9:
          flow = _context5.sent;

          if (!flow) {
            this.throw(ERROR_CODE_BADINPUT, ERROR_FLOW_NOT_FOUND, { details: { type: ERROR_FLOW_NOT_FOUND, message: ERROR_FLOW_NOT_FOUND } });
          }

          activity = _activitySchemaToTask(activity.schema);
          if (!flowUtils.findNodeNotChildren(flow)) {
            this.throw(ERROR_CODE_BADINPUT, ERROR_MISSING_TRIGGER, { details: { type: ERROR_MISSING_TRIGGER, message: ERROR_MISSING_TRIGGER } });
          }
          flow = flowUtils.addActivityToFlow(flow, activity);

          _context5.next = 16;
          return updateFlow(flow);

        case 16:
          res = _context5.sent;


          if (res && res.ok && res.ok == true) {
            response.status = 200;
            response.id = res.id;
            response.name = flow.name || '';
          } else {
            this.throw(ERROR_CODE_SERVERERROR, ERROR_WRITING_DATABASE, { details: { type: ERROR_WRITING_DATABASE, message: ERROR_WRITING_DATABASE } });
          }

          this.body = response;
          _context5.next = 21;
          return next;

        case 21:
        case 'end':
          return _context5.stop();
      }
    }
  }, _marked[4], this);
}

function exportFlowInJsonById(next) {
  var flowId, errMsg, filename, flowInfo;
  return regeneratorRuntime.wrap(function exportFlowInJsonById$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          console.log('[INFO] Export flow in JSON by ID');

          flowId = _lodash2.default.get(this, 'params.id');
          errMsg = {
            'INVALID_PARAMS': 'Invalid flow id.',
            'FLOW_NOT_FOUND': 'Cannot find flow [___FLOW_ID___].'
          };
          filename = _appConfig.flowExport.filename || 'export.json';

          if (!_lodash2.default.isUndefined(flowId)) {
            _context6.next = 8;
            break;
          }

          // invalid parameters
          this.throw(400, errMsg.INVALID_PARAMS);

          _context6.next = 12;
          break;

        case 8:
          _context6.next = 10;
          return _getFlowById(flowId);

        case 10:
          flowInfo = _context6.sent;


          if (_lodash2.default.isNil(flowInfo) || _lodash2.default.isObject(flowInfo) && _lodash2.default.isEmpty(flowInfo)) {

            // cannot find the flow
            this.throw(404, errMsg.FLOW_NOT_FOUND.replace('___FLOW_ID___', flowId));
          } else {

            // export the flow information as a JSON file
            this.type = 'application/json;charset=UTF-8';
            this.attachment(filename);

            // processing the flow information to omit unwanted fields
            this.body = _lodash2.default.omitBy(flowInfo, function (propVal, propName) {

              if (['_id', '_rev', '_conflicts', 'updated_at', 'created_at'].indexOf(propName) !== -1) {
                return true;
              }

              // remove the `__status` attribute from `paths.nodes`
              if (propName === 'paths') {
                var nodes = _lodash2.default.get(propVal, 'nodes', {});

                if (!_lodash2.default.isEmpty(nodes)) {
                  _lodash2.default.forIn(nodes, function (n) {
                    _lodash2.default.unset(n, '__status');
                  });
                }
              }

              // remove the `__status` and `__props` attributes from `items`
              if (propName === 'items') {

                if (!_lodash2.default.isEmpty(propVal)) {
                  _lodash2.default.forIn(propVal, function (item) {
                    _lodash2.default.each(['__status', '__props'], function (path) {
                      // If is not trigger, remove __props
                      if (item.type !== _constants.FLOGO_TASK_TYPE.TASK_ROOT) {
                        _lodash2.default.unset(item, path);
                      }
                    });
                  });
                }
              }

              return false;
            });
          }

        case 12:
          _context6.next = 14;
          return next;

        case 14:
        case 'end':
          return _context6.stop();
      }
    }
  }, _marked[5], this);
}

function importFlowFromJson(next) {
  var importedFile, imported, createFlowResult;
  return regeneratorRuntime.wrap(function importFlowFromJson$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          console.log('[INFO] Import flow from JSON');

          importedFile = _lodash2.default.get(this, 'request.body.files.importFile');

          if (!(_lodash2.default.isObject(importedFile) && !_lodash2.default.isEmpty(importedFile))) {
            _context7.next = 25;
            break;
          }

          if (!(importedFile.type !== 'application/json')) {
            _context7.next = 8;
            break;
          }

          console.error('[ERROR]: ', importedFile);
          this.throw(400, 'Unsupported file type: ' + importedFile.type + '; Support application/json only.');
          _context7.next = 23;
          break;

        case 8:

          /* processing the imported file */

          imported = void 0;

          // read file data into string

          try {
            imported = (0, _fs.readFileSync)(importedFile.path, { encoding: 'utf-8' });
          } catch (err) {
            console.error('[ERROR]: ', err);
            this.throw(500, 'Cannot read the uploaded file.', { expose: true });
          }

          // parse file date to object
          try {
            imported = JSON.parse(imported);
          } catch (err) {
            console.error('[ERROR]: ', err);
            this.throw(400, 'Invalid JSON data.');
          }

          // create the flow with the parsed imported data
          createFlowResult = void 0;
          _context7.prev = 12;
          _context7.next = 15;
          return createFlow(imported);

        case 15:
          createFlowResult = _context7.sent;
          _context7.next = 22;
          break;

        case 18:
          _context7.prev = 18;
          _context7.t0 = _context7['catch'](12);

          console.error('[ERROR]: ', _context7.t0);
          this.throw(500, 'Fail to create flow.', { expose: true });

        case 22:

          this.body = createFlowResult;

        case 23:
          _context7.next = 27;
          break;

        case 25:
          console.log(this.request.body.files);
          this.throw(400, 'Invalid file.');

        case 27:
          _context7.next = 29;
          return next;

        case 29:
        case 'end':
          return _context7.stop();
      }
    }
  }, _marked[6], this, [[12, 18]]);
}

/**
 *
 * @param triggerName: string
 * @returns {*}
 */
function _getTriggerByName(triggerName) {
  var _dbTrigger = _appConfig.triggersDBService;
  var trigger = triggerName;

  return new Promise(function (resolve, reject) {
    _dbTrigger.db.query(function (doc, emit) {
      emit(doc._id);
    }, { key: trigger, include_docs: true }).then(function (response) {
      var rows = response && response.rows || [];
      var doc = rows.length > 0 ? rows[0].doc : null;
      resolve(doc);
    }).catch(function (err) {
      reject(err);
    });
  });
}

/**
 *
 * @param activityName: string
 * @returns {*}
 */
function _getActivityByName(activityName) {
  var _dbActivities = _appConfig.activitiesDBService;
  var activity = activityName;

  return new Promise(function (resolve, reject) {
    _dbActivities.db.query(function (doc, emit) {
      emit(doc._id);
    }, { key: activity, include_docs: true }).then(function (response) {
      var rows = response && response.rows || [];
      var doc = rows.length > 0 ? rows[0].doc : null;
      resolve(doc);
    }).catch(function (err) {
      reject(err);
    });
  });
}

function _activitySchemaToTrigger(schema) {
  var trigger = {
    type: _constants.FLOGO_TASK_TYPE.TASK_ROOT,
    triggerType: _lodash2.default.get(schema, 'name', ''),
    name: _lodash2.default.get(schema, 'name', ''),
    version: _lodash2.default.get(schema, 'version', ''),
    title: _lodash2.default.get(schema, 'title', ''),
    description: _lodash2.default.get(schema, 'description', ''),
    settings: _lodash2.default.get(schema, 'settings', ''),
    outputs: _lodash2.default.get(schema, 'outputs', ''),
    endpoint: { settings: _lodash2.default.get(schema, 'endpoint.settings', '') }
  };

  _lodash2.default.each(trigger.outputs, function (output) {
    // convert to task enumeration and provision default types
    _lodash2.default.assign(output, portAttribute(output));
  });

  return trigger;
}

function _isRequiredConfiguration(schema) {
  var inputs = _lodash2.default.get(schema, 'inputs', []);
  var index = _lodash2.default.findIndex(inputs, function (input) {
    return input.required == true;
  });

  return index !== -1;
}

// mapping from schema.json of activity to the task can be used in flow.json
function _activitySchemaToTask(schema) {

  var task = {
    type: _constants.FLOGO_TASK_TYPE.TASK,
    activityType: _lodash2.default.get(schema, 'name', ''),
    name: _lodash2.default.get(schema, 'title', _lodash2.default.get(schema, 'name', 'Activity')),
    version: _lodash2.default.get(schema, 'version', ''),
    title: _lodash2.default.get(schema, 'title', ''),
    description: _lodash2.default.get(schema, 'description', ''),
    attributes: {
      inputs: _lodash2.default.get(schema, 'inputs', []),
      outputs: _lodash2.default.get(schema, 'outputs', [])
    },
    __props: {
      warnings: []
    }
  };

  if (_isRequiredConfiguration(schema)) {
    task.__props.warnings.push({ msg: "Configure Required" });
  }

  _lodash2.default.each(task.attributes.inputs, function (input) {
    // convert to task enumeration and provision default types
    _lodash2.default.assign(input, portAttribute(input, true));
  });

  _lodash2.default.each(task.attributes.outputs, function (output) {
    // convert to task enumeration and provision default types
    _lodash2.default.assign(output, portAttribute(output));
  });

  return task;
}

function portAttribute(inAttr, withDefault) {
  if (withDefault === void 0) {
    withDefault = false;
  }
  var outAttr = _lodash2.default.assign({}, inAttr);

  outAttr.type = _constants.FLOGO_TASK_ATTRIBUTE_TYPE[_lodash2.default.get(outAttr, 'type', 'STRING').toUpperCase()];

  if (withDefault && _lodash2.default.isUndefined(outAttr.value)) {
    outAttr.value = getDefaultValue(outAttr.type);
  }
  return outAttr;
}

// get default value of a given type
function getDefaultValue(type) {
  var defaultValues = [];

  defaultValues[_constants.FLOGO_TASK_ATTRIBUTE_TYPE.STRING] = '';
  defaultValues[_constants.FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER] = 0;
  defaultValues[_constants.FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER] = 0.0;
  defaultValues[_constants.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN] = false;
  defaultValues[_constants.FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT] = null;
  defaultValues[_constants.FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY] = [];
  defaultValues[_constants.FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS] = null;

  return defaultValues[type];
}

/**
 *
 * @param id: string
 * @returns {*}
 */
function _getFlowById(id) {

  var options = {
    include_docs: true,
    startKey: '' + FLOW + DELIMITER + DEFAULT_USER_ID + DELIMITER,
    endKey: '' + FLOW + DELIMITER + DEFAULT_USER_ID + DELIMITER + '￿'
  };

  // TODO:  replace with a persistent query: https://pouchdb.com/guides/queries.html
  return _dbService.db.query(function (doc, emit) {
    emit(doc.name);
  }, options).then(function (response) {
    var flow = null;
    var rows = response && response.rows || [];

    rows.forEach(function (item) {
      // if this item's tabel is FLOW
      if (item && item.doc && item.doc.$table === FLOW && item.doc._id === id) {
        flow = item.doc;
      }
    });

    return flow;
  });
}
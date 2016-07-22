"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_SCHEMA_ROOT_FOLDER_NAME = exports.DEFAULT_PATH_ACTIVITY = exports.DEFAULT_PATH_TRIGGER = exports.SCHEMA_FILE_NAME_ACTIVITY = exports.SCHEMA_FILE_NAME_TRIGGER = exports.TYPE_UNKNOWN = exports.TYPE_ACTIVITY = exports.TYPE_TRIGGER = exports.FLOGO_ENGINE_STATUS = exports.FLOGO_TASK_ATTRIBUTE_TYPE = exports.FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE = exports.FLOGO_PROCESS_TYPE = exports.FLOGO_TASK_TYPE = exports.FLOGO_FLOW_DIAGRAM_NODE_TYPE = undefined;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FLOGO_FLOW_DIAGRAM_NODE_TYPE = exports.FLOGO_FLOW_DIAGRAM_NODE_TYPE = {
  0: "NODE_PADDING",
  1: "NODE_HOLDER",
  2: "NODE_ADD",
  3: "NODE_ROOT",
  4: "NODE_ROOT_NEW",
  5: "NODE",
  6: "NODE_BRANCH",
  7: "NODE_LINK",
  8: "NODE_SUB_PROC",
  9: "NODE_LOOP",
  "NODE_PADDING": 0, // padding node
  "NODE_HOLDER": 1, // placeholder node
  "NODE_ADD": 2, // node to add an activity
  "NODE_ROOT": 3, // the trigger node
  "NODE_ROOT_NEW": 4, // node to add a trigger
  "NODE": 5, // activity node
  "NODE_BRANCH": 6, // the branch line node
  "NODE_LINK": 7, // the link node
  "NODE_SUB_PROC": 8, // activity with sub flow
  "NODE_LOOP": 9 // repeatable activity
};

var FLOGO_TASK_TYPE = exports.FLOGO_TASK_TYPE = {
  0: "TASK_ROOT",
  1: "TASK",
  2: "TASK_BRANCH",
  3: "TASK_SUB_PROC",
  4: "TASK_LOOP",
  "TASK_ROOT": 0,
  "TASK": 1,
  "TASK_BRANCH": 2,
  "TASK_SUB_PROC": 3,
  "TASK_LOOP": 4
};

var FLOGO_PROCESS_TYPE = exports.FLOGO_PROCESS_TYPE = {
  1: "DEFAULT",
  "DEFAULT": 1
};

var FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE = exports.FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE = {
  0: "DEFAULT",
  1: "BRANCH",
  2: "LABELED",
  "DEFAULT": 0,
  "BRANCH": 1,
  "LABELED": 2
};

var FLOGO_TASK_ATTRIBUTE_TYPE = exports.FLOGO_TASK_ATTRIBUTE_TYPE = {
  0: "STRING",
  1: "INTEGER",
  2: "NUMBER",
  3: "BOOLEAN",
  4: "OBJECT",
  5: "ARRAY",
  6: "PARAMS",
  "STRING": 0,
  "INTEGER": 1,
  "NUMBER": 2,
  "BOOLEAN": 3,
  "OBJECT": 4,
  "ARRAY": 5,
  "PARAMS": 6
};

var FLOGO_ENGINE_STATUS = exports.FLOGO_ENGINE_STATUS = {
  '0': 'ADDING_MODEL',
  '1': 'ADDING_ACTIVITY',
  '2': 'ADDING_TRIGGER',
  '3': 'ADDING_FLOW',
  '4': 'REMOVING_MODEL',
  '5': 'REMOVING_ACTIVITY',
  '6': 'REMOVING_TRIGGER',
  '7': 'REMOVING_FLOW',
  '8': 'UPDATING_CONFIG_JSON',
  '9': 'UPDATING_TRIGGER_JSON',
  '10': 'BUILDING',
  '11': 'STARTING',
  '12': 'STOPPING',
  '13': 'CREATING',
  '14': 'REMOVING',
  '15': 'STOPPED',
  '16': 'STARTED',
  '17': 'CREATED',
  '18': 'REMOVED',
  ADDING_MODEL: 0,
  ADDING_ACTIVITY: 1,
  ADDING_TRIGGER: 2,
  ADDING_FLOW: 3,
  REMOVING_MODEL: 4,
  REMOVING_ACTIVITY: 5,
  REMOVING_TRIGGER: 6,
  REMOVING_FLOW: 7,
  UPDATING_CONFIG_JSON: 8,
  UPDATING_TRIGGER_JSON: 9,
  BUILDING: 10,
  STARTING: 11,
  STOPPING: 12,
  CREATING: 13,
  REMOVING: 14,
  STOPPED: 15,
  STARTED: 16,
  CREATED: 17,
  REMOVED: 18
};
// // generation function.
// export const FLOGO_ENGINE_STATUS = (()=> {
//
//   const items = [
//     {
//       'adding' : [ 'model', 'activity', 'trigger', 'flow' ]
//     }, {
//       'removing' : [ 'model', 'activity', 'trigger', 'flow' ]
//     }, {
//       'updating' : [ 'configJson', 'triggerJson' ]
//     },
//     { 'building' : [] },
//     { 'starting' : [] },
//     { 'stopping' : [] },
//     { 'creating' : [] },
//     { 'removing' : [] },
//     { 'stopped' : [] },
//     { 'started' : [] },
//     { 'created' : [] },
//     { 'removed' : [] }
//   ];
//
//   let status = {};
//
//   // generate keys
//   let statusKeys = _.reduce( items, ( _status, item, idx ) => {
//     let keys = _.keys( item );
//
//     return _.reduce( keys, ( _statusOfKey, key ) => {
//
//       if ( items[ idx ][ key ].length < 1 ) {
//         _statusOfKey.push( key.toUpperCase() );
//       } else {
//         _statusOfKey = _statusOfKey.concat( _.map( items[ idx ][ key ], ( elm ) => {
//           return `${key.toUpperCase()}_${_.snakeCase( elm )
//             .toUpperCase()}`;
//         } ) );
//       }
//
//       return _statusOfKey;
//     }, _status );
//   }, [] );
//
//   // generate status obj
//   return _.reduce( statusKeys, ( _status, statusKey, idx ) => {
//     _status[ statusKey ] = idx;
//     _status[ idx ] = statusKey;
//
//     return _status;
//   }, status );
//
// })();
//
// console.log( FLOGO_ENGINE_STATUS );

var TYPE_TRIGGER = exports.TYPE_TRIGGER = 'trigger';
var TYPE_ACTIVITY = exports.TYPE_ACTIVITY = 'activity';
var TYPE_UNKNOWN = exports.TYPE_UNKNOWN = 'unknown';

var SCHEMA_FILE_NAME_TRIGGER = exports.SCHEMA_FILE_NAME_TRIGGER = 'trigger.json';
var SCHEMA_FILE_NAME_ACTIVITY = exports.SCHEMA_FILE_NAME_ACTIVITY = 'activity.json';

var DEFAULT_PATH_TRIGGER = exports.DEFAULT_PATH_TRIGGER = 'packages/triggers';
var DEFAULT_PATH_ACTIVITY = exports.DEFAULT_PATH_ACTIVITY = 'packages/activities';

var DEFAULT_SCHEMA_ROOT_FOLDER_NAME = exports.DEFAULT_SCHEMA_ROOT_FOLDER_NAME = 'ui';
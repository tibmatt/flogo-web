import {config, dbService, triggersDBService, activitiesDBService, flowExport} from '../../config/app-config';
import {DBService} from '../../common/db.service';
import {isJSON, flogoIDEncode, flogoIDDecode, flogoGenTaskID, genNodeID} from '../../common/utils';
import {FLOGO_FLOW_DIAGRAM_NODE_TYPE, FLOGO_TASK_TYPE,FLOGO_TASK_ATTRIBUTE_TYPE} from '../../common/constants';
import _ from 'lodash';
import * as flowUtils from './flows.utils';
import { readFileSync } from 'fs';

let basePath = config.app.basePath;
let dbDefaultName = config.db;
let _dbService = dbService;
let FLOW = 'flows';
let DELIMITER = ":";
let DEFAULT_USER_ID = 'flogoweb-admin';

const ERROR_TRIGGER_NOT_FOUND  = 'TRIGGER_NOT_FOUND';
const ERROR_ACTIVITY_NOT_FOUND = 'ACTIVITY_NOT_FOUND';
const ERROR_FLOW_NOT_FOUND     = 'FLOW_NOT_FOUND';
const ERROR_MISSING_TRIGGER    = 'MISSING_TRIGGER';
const ERROR_WRITING_DATABASE   = 'ERROR_WRITING_DATABASE';
const ERROR_CODE_BADINPUT      = 400;
const ERROR_CODE_SERVERERROR   = 500;


function getAllFlows(){
  let options = {
    include_docs: true,
    startKey: `${FLOW}${DELIMITER}${DEFAULT_USER_ID}${DELIMITER}`,
    endKey: `${FLOW}${DELIMITER}${DEFAULT_USER_ID}${DELIMITER}\uffff`
  };

  return new Promise((resolve, reject)=>{
    _dbService.db.allDocs(options).then((response)=>{
      let allFlows = [];
      let rows = response&&response.rows||[];
      rows.forEach((item)=>{
        // if this item's tabel is FLOW
        if(item&&item.doc&&item.doc.$table === FLOW){
          allFlows.push(item.doc);
        }
      });
      resolve(allFlows);
    }).catch((err)=>{
      reject(err);
    });
  });
}

/**
 *
 * @param query {name: string}
 * @returns {*}
 */
function filterFlows(query){
  query = _.assign({}, {name:''}, query);

  let options = {
    include_docs: true,
    startKey: `${FLOW}${DELIMITER}${DEFAULT_USER_ID}${DELIMITER}`,
    endKey: `${FLOW}${DELIMITER}${DEFAULT_USER_ID}${DELIMITER}\uffff`,
    key: query.name.toLowerCase()
  };

  // TODO:  repplace with a persistent query: https://pouchdb.com/guides/queries.html
  return _dbService.db
    .query(function(doc, emit) { emit(doc.name.toLowerCase()); }, options)
    .then((response) => {
      let allFlows = [];
      let rows = response&&response.rows||[];
      rows.forEach((item)=>{
        // if this item's tabel is FLOW
        if(item&&item.doc&&item.doc.$table === FLOW){
          allFlows.push(item.doc);
        }
      });
      return allFlows;
    });
}

export function getActivities() {
  return new Promise( (resolve, reject) => {
    activitiesDBService.allDocs({ include_docs: true })
      .then( (activities)=> {
        let all = activities.map((activity)=> {
          return  {
            name: activity._id,
            type: FLOGO_TASK_TYPE.TASK
          };
        });
        resolve(all);
      }).catch((err)=>{
          reject(err);
      });
  });
}

export function getTriggers() {
  return new Promise( (resolve, reject) => {
    triggersDBService.allDocs({ include_docs: true })
      .then( (activities)=> {
        let all = activities.map((activity)=> {
          return  {
            name: activity._id,
            type: FLOGO_TASK_TYPE.TASK_ROOT
          };
        });
        resolve(all);
      }).catch((err)=>{
      reject(err);
    });
  });
}

function createFlow(flowObj){

  return new Promise((resolve, reject)=>{
    _dbService.create(flowObj)
              .then((response)=>{
                      resolve(response);
              })
              .catch((err)=>{
                reject(err);
              });
  });
}

function updateFlow(flowObj){
  return new Promise((resolve, reject)=>{
    _dbService.update(flowObj).then((response)=>{
      resolve(response);
    }).catch((err)=>{
      reject(err);
    });
  });
}

export function flows(app, router){
  if(!app){
    console.error("[Error][api/activities/index.js]You must pass app");
  }

  router.get(basePath+"/flows", getFlows);
  router.post(basePath+"/flows", createFlows);
  router.delete(basePath+"/flows", deleteFlows);

  // {
  //   name: "tibco-mqtt"
  // }
  router.post(basePath+"/flows/triggers", addTrigger);
  router.post(basePath+"/flows/activities", addActivity);

  router.post(basePath+'/flows/json', importFlowFromJsonFile);
  router.get(basePath+'/flows/:id/json', exportFlowInJsonById);
}

/**
 * @swagger
 *  /flows:
 *    get:
 *      tags:
 *        - Flow
 *      summary: Get all the flows information.
 *      responses:
 *        200:
 *          description: "Flows' information obtained successfully."
 *          schema:
 *            type: array
 *            items:
 *              $ref: '#/definitions/Full-Flow'
 */
function* getFlows(next){
  let data = [];

    if (!_.isEmpty(this.query)) {
      data = yield filterFlows(this.query);
    } else {
      data = yield getAllFlows();
    }

    this.body = data;
}
/**
 * @swagger
 * definition:
 *  Full-Flow:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      paths:
 *        type: object
 *        properties:
 *          root:
 *            type: object
 *            properties:
 *              is:
 *                type: string
 *          nodes:
 *            type: object
 *      items:
 *        type: object
 *      $table:
 *        type: string
 *      errorHandler:
 *        type: object
 *        properties:
 *          paths:
 *            type: object
 *            properties:
 *              root:
 *                type: object
 *                properties:
 *                  is:
 *                    type: string
 *          items:
 *            type: object
 *      created_at:
 *        type: string
 *        format: dateTime
 *      updated_at:
 *        type: string
 *        format: dateTime
 *      _id:
 *        type: string
 *      _rev:
 *        type: string
 */

/**
 * @swagger
 *  /flows:
 *    post:
 *      tags:
 *        - Flow
 *      summary: Add a new flow.
 *      parameters:
 *        - name: New Flow
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              description:
 *                type: string
 *      responses:
 *        '200':
 *          description: Flow added successfully.
 *          schema:
 *            type: object
 *            properties:
 *              ok:
 *                type: boolean
 *              id:
 *                type: string
 *                description: The new flow's ID
 *              rev:
 *                type: string
 */
function* createFlows(next){
  console.log("createFlows");
  try{
    let data = this.request.body||{};
    if(typeof this.request.body == 'string'){
      if(isJSON(this.request.body)){
        data = JSON.parse(this.request.body);
      }
    }
    let flowObj = {};
    flowObj.name = data.name||"";
    flowObj.description = data.description || "";
    flowObj._id = _dbService.generateFlowID();
    flowObj.$table = _dbService.getIdentifier("FLOW");
    flowObj.paths = {};
    flowObj.items = {};
    let res = yield createFlow(flowObj);
    this.body = res;
  }catch(err){
    /*
    var error = {
      code: 500,
      message: err.message
    };
    */
    this.body = err;
  }
}

/**
 * @swagger
 *  /flows:
 *    delete:
 *      tags:
 *        - Flow
 *      summary: Not implemented yet.
 *      responses:
 *        '200':
 *          description: Flow deleted successfully
 *          schema:
 *            type: string
 *            default: deleteFlows
 */
function* deleteFlows(next){
  console.log("deleteFlows");
  this.body = 'deleteFlows';
  yield next;
}

/**
 * @swagger
 *  /flows/triggers:
 *    post:
 *      tags:
 *        - Trigger
 *        - Flow
 *      summary: Add a new trigger to the flow
 *      parameters:
 *        - name: New trigger
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: Trigger name
 *              flowId:
 *                type: string
 *                description: Flow's ID
 *      responses:
 *        '200':
 *          description: Trigger added successfully.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: number
 *                default: 200
 *              id:
 *                type: string
 *                description: Flow's ID
 *              name:
 *                type: string
 *                description: Flow's name
 */
function * addTrigger(next){
  let response = {};
  //TODO validate this query is json
  var params = _.assign({},{name:'', flowId:''}, this.request.body || {}, this.query);

  let trigger = yield _getTriggerByName(params.name);
  if(!trigger) { this.throw(ERROR_CODE_BADINPUT,ERROR_TRIGGER_NOT_FOUND, { details: { type:ERROR_TRIGGER_NOT_FOUND, message:ERROR_TRIGGER_NOT_FOUND}} ); }

  let flow = yield _getFlowById(params.flowId);
  if(!flow) { this.throw(ERROR_CODE_BADINPUT, ERROR_FLOW_NOT_FOUND, { details:{ type:ERROR_FLOW_NOT_FOUND, message:ERROR_FLOW_NOT_FOUND}} ); }

  trigger = _activitySchemaToTrigger(trigger.schema);
  flow = flowUtils.addTriggerToFlow(flow, trigger);

  let res = yield updateFlow(flow);

  if(res&&res.ok && res.ok == true) {
     response.status = 200;
     response.id = res.id;
     response.name = flow.name || '';
  } else {
    this.throw(ERROR_CODE_SERVERERROR, ERROR_WRITING_DATABASE, {details:{ type:ERROR_WRITING_DATABASE, message:ERROR_WRITING_DATABASE}});
  }

  this.body = response;
}

/**
 * @swagger
 *  /flows/activities:
 *    post:
 *      tags:
 *        - Flow
 *        - Activity
 *      summary: Add a new activity to an specific flow.
 *      parameters:
 *        - name: New Activity
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: New activity's name
 *              flowId:
 *                type: string
 *                description: Flow's ID
 *      responses:
 *        '200':
 *          description: Activity added successfully.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: number
 *                default: 200
 *              id:
 *                type: string
 *                description: Flow's ID
 *              name:
 *                type: string
 *                description: Flow's name
 */
function * addActivity(next){
  let response = {};
  var params = _.assign({},{name:'', flowId:''}, this.request.body || {}, this.query);

  let activity = yield _getActivityByName(params.name);
  if(!activity) { this.throw(ERROR_CODE_BADINPUT, ERROR_ACTIVITY_NOT_FOUND, { details: { type:ERROR_ACTIVITY_NOT_FOUND, message:ERROR_ACTIVITY_NOT_FOUND}} );};

  let flow = yield _getFlowById(params.flowId);
  if(!flow) { this.throw(ERROR_CODE_BADINPUT, ERROR_FLOW_NOT_FOUND, { details:{ type:ERROR_FLOW_NOT_FOUND, message:ERROR_FLOW_NOT_FOUND}} ); }



  activity = _activitySchemaToTask(activity.schema);
  if(!flowUtils.findNodeNotChildren(flow)) {
    this.throw(ERROR_CODE_BADINPUT, ERROR_MISSING_TRIGGER, { details:{ type:ERROR_MISSING_TRIGGER, message:ERROR_MISSING_TRIGGER}} );
  }
  flow = flowUtils.addActivityToFlow(flow, activity);

  let res = yield updateFlow(flow);

  if(res&&res.ok && res.ok == true) {
    response.status = 200;
    response.id = res.id;
    response.name = flow.name || '';
  }else {
    this.throw(ERROR_CODE_SERVERERROR, ERROR_WRITING_DATABASE, { details: { type:ERROR_WRITING_DATABASE, message:ERROR_WRITING_DATABASE} } );
  }

  this.body = response;
  yield next;
}

/**
 * @swagger
 *  /flows/{flowId}/json:
 *    get:
 *      tags:
 *        - Flow
 *      summary: Obtain the information of a specific Flow in JSON format
 *      parameters:
 *        - name: flowId
 *          in: path
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: Flow information obtained successfully
 *          schema:
 *            $ref: '#/definitions/Flow'
 */
function * exportFlowInJsonById( next ) {
  console.log( '[INFO] Export flow in JSON by ID' );

  let flowId = _.get( this, 'params.id' );
  let errMsg = {
    'INVALID_PARAMS' : 'Invalid flow id.',
    'FLOW_NOT_FOUND' : 'Cannot find flow [___FLOW_ID___].'
  };
  let filename = flowExport.filename || 'export.json';

  if ( _.isUndefined( flowId ) ) {

    // invalid parameters
    this.throw( 400, errMsg.INVALID_PARAMS );

  } else {

    let flowInfo = yield _getFlowById( flowId );

    if ( _.isNil( flowInfo ) || _.isObject( flowInfo ) && _.isEmpty( flowInfo ) ) {

      // cannot find the flow
      this.throw( 404, errMsg.FLOW_NOT_FOUND.replace( '___FLOW_ID___', flowId ) );

    } else {

      // export the flow information as a JSON file
      this.type = 'application/json;charset=UTF-8';
      this.attachment( filename );

      // processing the flow information to omit unwanted fields
      this.body = _.omitBy( flowInfo, ( propVal, propName ) => {

        if ( [ '_id', '_rev', '_conflicts', 'updated_at', 'created_at' ].indexOf( propName ) !== -1 ) {
          return true;
        }

        // remove the `__status` attribute from `paths.nodes`
        if ( propName === 'paths' ) {
          let nodes = _.get( propVal, 'nodes', {} );

          if ( !_.isEmpty( nodes ) ) {
            _.forIn( nodes, ( n )=> {
              _.unset( n, '__status' );
            } );
          }
        }

        // remove the `__status` and `__props` attributes from `items`
        if ( propName === 'items' ) {

          if ( !_.isEmpty( propVal ) ) {
            _.forIn( propVal, ( item )=> {
              _.each( [ '__status', '__props' ], ( path ) => {
                // If is not trigger, remove __props
                if(item.type !== FLOGO_TASK_TYPE.TASK_ROOT) {
                  _.unset( item, path );
                }
              } );
            } );
          }

        }

        return false;
      } );
    }
  }

  yield next;
}
/**
 * @swagger
 * definition:
 *  Flow:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      paths:
 *        type: object
 *        properties:
 *          root:
 *            type: object
 *            properties:
 *              is:
 *                type: string
 *          nodes:
 *            type: object
 *      items:
 *        type: object
 *      $table:
 *        type: string
 *      errorHandler:
 *        type: object
 *        properties:
 *          paths:
 *            type: object
 *            properties:
 *              root:
 *                type: object
 *                properties:
 *                  is:
 *                    type: string
 *          items:
 *            type: object
 */

function validateFlow(flow, activities, triggers) {
  return new Promise((resolve, reject) => {
    let validateErrors = [];

    try {
      validateErrors = validateTriggersAndActivities(flow, triggers, activities);
    }catch (err) {
      resolve({status:500, details:err});
    }
    if(validateErrors.hasErrors) {
      let details = {
        details: {
          message: "Flow could not be imported, missing triggers/activities",
          activities: validateErrors.activities,
          triggers: validateErrors.triggers,
          ERROR_CODE: "ERROR_VALIDATION"
        }
      };
      reject({status:400, details:details})
    }else {
      resolve({status:200})
    }
  });
}

export function  createFlowFromJson(imported ) {
  return new Promise( (resolve, reject) => {
    let activities, triggers;
     getActivities()
      .then((items)=> {
        activities = items;
        getTriggers()
          .then((items)=>{
            triggers = items;
            validateFlow(imported,activities,triggers)
              .then((res) => {
                if(res.status == 200) {
                  createFlow( imported )
                    .then((createFlowResult)=> {
                      resolve({status: res.status, details:createFlowResult});
                    })
                    .catch((err) => {
                      resolve( {status:err.status || 500, details: err.details } );
                    });
                }else {
                  resolve(res);
                }
              })
              .catch((err) => {
                reject(err);
              });

          })
      })



   });
}

/**
 * @swagger
 *  /flows/json:
 *    post:
 *      tags:
 *        - Flow
 *      summary: Import a flow from a json
 *      parameters:
 *        - name: Flow
 *          in: body
 *          required: true
 *          description: The flow has to be uploaded as a file
 *          schema:
 *            type: object
 *            properties:
 *              flow:
 *                $ref: '#/definitions/Flow'
 *      responses:
 *        '200':
 *          description: Flow imported successfully.
 *          schema:
 *            type: object
 *            properties:
 *              ok:
 *                type: boolean
 *              id:
 *                type: string
 *                description: Flow's ID
 *              rev:
 *                type: string
 */
function * importFlowFromJsonFile( next ) {
  console.log( '[INFO] Import flow from JSON File' );

  let importedFile = _.get( this, 'request.body.files.importFile' );
  let params = _.get(this, 'request.query', {});


  if ( _.isObject( importedFile ) && !_.isEmpty( importedFile ) ) {

    // only support `application/json`
    if ( importedFile.type !== 'application/json' ) {
      console.error( '[ERROR]: ', importedFile );
      this.throw( 400, 'Unsupported file type: ' + importedFile.type + '; Support application/json only.' );
    } else {
      /* processing the imported file */
      let imported;

      // read file data into string
      try {
        imported = readFileSync( importedFile.path, { encoding : 'utf-8' } );
      } catch ( err ) {
        console.error( '[ERROR]: ', err );
        this.throw( 500, 'Cannot read the uploaded file.', { expose : true } );
      }

      // parse file date to object
      try {
        imported = JSON.parse( imported );
        if(params['name']) {
          imported.name = params.name;
        }
      } catch ( err ) {
        console.error( '[ERROR]: ', err );
        this.throw( 400, 'Invalid JSON data.' );
      }

      let responseCreateFlow = yield createFlowFromJson(imported);
      this.body = responseCreateFlow;
      this.response.status = responseCreateFlow.status;

    }
  } else {
    this.throw( 400, 'Invalid file.' );
  }

  yield next;
}



function validateTriggersAndActivities (flow, triggers, activities) {
  let validate = { activities: [], triggers: [], hasErrors: false};

  try {
    let installedTiles = triggers.concat(activities);
    let tilesMainFlow = getTilesFromFlow(_.get(flow, 'items', []));
    let tilesErrorFlow = getTilesFromFlow(_.get(flow, 'errorHandler.items', []));
    let allTilesFlow = _.uniqBy(tilesMainFlow.concat(tilesErrorFlow), (elem) => {
      return elem.name + elem.type;
    });

    allTilesFlow.forEach( (tile) => {
      let index = installedTiles.findIndex((installed)=> {
        return installed.name == tile.name && installed.type == tile.type;
      });

      if(index == -1) {
        validate.hasErrors = true;
        if(tile.type == FLOGO_TASK_TYPE.TASK_ROOT) {
          validate.triggers.push(tile.name);
        } else {
          validate.activities.push(tile.name);
        }
      }
    });
  } catch(err) {
    this.throw(err);
  }

  return validate;
}

function getTilesFromFlow(items) {
    let tiles = [];

    for(var key in items)  {
      let item = items[key];

      if(item.type == FLOGO_TASK_TYPE.TASK_ROOT || item.type == FLOGO_TASK_TYPE.TASK) {
        if(item.triggerType&&item.triggerType=='__error-trigger') {
        }else {
          let tile = {
              type: item.type,
              name: item.triggerType || item.activityType,
              homepage: item.homepage || ''
          };
          let index = tiles.findIndex((obj)=> {
            return tile.type == obj.type && tile.name == obj.name;
          });
          if(index == -1) {
            tiles.push(tile);
          }
        }

      }
    }

  return tiles;

}

/**
 *
 * @param triggerName: string
 * @returns {*}
 */
function _getTriggerByName(triggerName) {
  let _dbTrigger = triggersDBService;
  let trigger = triggerName;

  return new Promise(function (resolve, reject) {
    _dbTrigger.db
      .query(function(doc, emit) {emit(doc._id);}, {key:trigger, include_docs:true})
      .then(function (response) {
        let rows = response&&response.rows||[];
        let doc = rows.length > 0 ? rows[0].doc : null;
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
  let _dbActivities = activitiesDBService;
  let activity = activityName;

  return new Promise(function (resolve, reject) {
    _dbActivities.db
      .query(function(doc, emit) {emit(doc._id);}, {key:activity, include_docs:true})
      .then(function (response) {
        let rows = response&&response.rows||[];
        let doc = rows.length > 0 ? rows[0].doc : null;
        resolve(doc);

      }).catch(function (err) {
      reject(err);
    });
  });
}

function _getFlowByName(value) {
  let _dbFlows = dbService;
  let searchValue = value.toLowerCase();

  return new Promise(function (resolve, reject) {
    _dbFlows.db
      .query(function(doc, emit) {emit(doc.name.toLowerCase());}, {key:searchValue, include_docs:true})
      .then(function (response) {
        let rows = response&&response.rows||[];
        let doc = rows.length > 0 ? rows[0].doc : null;
        if(doc == null) {
          resolve({status:404, message: 'Flow not found', flow:null});
        } else {
          resolve({status:200, flow:doc});
        }
      })
      .catch(function (err) {
         reject({status:500, message:'Error getting the flow', flow:null});
    });

  });

}


function _activitySchemaToTrigger(schema) {
  let trigger = {
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    triggerType: _.get(schema, 'name', ''),
    name: _.get(schema, 'name', ''),
    version: _.get(schema, 'version', ''),
    title: _.get(schema, 'title', ''),
    description: _.get(schema, 'description', ''),
    settings: _.get(schema, 'settings', ''),
    outputs: _.get(schema, 'outputs', ''),
    endpoint: { settings: _.get(schema, 'endpoint.settings', '') }
  };

  _.each(
    trigger.outputs, (output) => {
      // convert to task enumeration and provision default types
      _.assign( output, portAttribute( output ) );
    }
  );

  return trigger;
}

function _isRequiredConfiguration(schema) {
  var inputs = _.get(schema, 'inputs', []);
  var index =  _.findIndex(inputs, function (input) {return input.required == true; } );

  return (index !== -1);
}

// mapping from schema.json of activity to the task can be used in flow.json
function _activitySchemaToTask(schema) {

  let task = {
    type: FLOGO_TASK_TYPE.TASK,
    activityType: _.get(schema, 'name', ''),
    name: _.get(schema, 'title', _.get(schema, 'name', 'Activity')),
    version: _.get(schema, 'version', ''),
    title: _.get(schema, 'title', ''),
    description: _.get(schema, 'description', ''),
    attributes: {
      inputs: _.get(schema, 'inputs', []),
      outputs: _.get(schema, 'outputs', [])
    },
    __props: {
      warnings:[]
    }
  };

  if(_isRequiredConfiguration(schema)) {
    task.__props.warnings.push({msg:"Configure Required"});
  }

  _.each(
    task.attributes.inputs, (input) => {
      // convert to task enumeration and provision default types
      _.assign( input, portAttribute( input, true ) );
    }
  );

  _.each(
    task.attributes.outputs, (output) => {
      // convert to task enumeration and provision default types
      _.assign( output, portAttribute( output ) );
    }
  );

  return task;
}

function portAttribute(inAttr, withDefault) {
  if (withDefault === void 0) { withDefault = false; }
  var outAttr = _.assign({}, inAttr);

  outAttr.type =  FLOGO_TASK_ATTRIBUTE_TYPE[_.get(outAttr, 'type', 'STRING').toUpperCase()];

  if (withDefault && _.isUndefined(outAttr.value)) {
    outAttr.value = getDefaultValue(outAttr.type);
  }
  return outAttr;
}

// get default value of a given type
function getDefaultValue(type) {
  let defaultValues = [];

  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.STRING] = '';
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER] = 0;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER] = 0.0;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN] = false;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT] = null;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY] = [];
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS] = null;

  return defaultValues[ type ];
}


/**
 *
 * @param id: string
 * @returns {*}
 */
function _getFlowById(id) {

  let options = {
    include_docs: true,
    startKey: `${FLOW}${DELIMITER}${DEFAULT_USER_ID}${DELIMITER}`,
    endKey: `${FLOW}${DELIMITER}${DEFAULT_USER_ID}${DELIMITER}\uffff`
  };

  // TODO:  replace with a persistent query: https://pouchdb.com/guides/queries.html
  return _dbService.db
    .query(function(doc, emit) { emit(doc.name);  }, options)
    .then((response) => {
      let flow = null;
      let rows = response&&response.rows||[];

      rows.forEach((item)=>{
        // if this item's tabel is FLOW
        if(item&&item.doc&&item.doc.$table === FLOW && item.doc._id === id){
          flow = item.doc;
        }
      });

      return flow;
    });
}

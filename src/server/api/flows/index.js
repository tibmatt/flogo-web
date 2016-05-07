import {config, dbService, triggersDBService, activitiesDBService} from '../../config/app-config';
import {DBService} from '../../common/db.service';
import {isJson, flogoIDEncode, flogoIDDecode, flogoGenTaskID, genNodeID} from '../../common/utils';
import {FLOGO_FLOW_DIAGRAM_NODE_TYPE, FLOGO_TASK_TYPE,FLOGO_TASK_ATTRIBUTE_TYPE} from '../../common/constants';
import _ from 'lodash';
import * as flowUtils from './flows.utils';

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
      // console.log(allFlows);
      //this.body = allFlows;
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
  query = _.assign({}, query);

  let options = {
    include_docs: true,
    startKey: `${FLOW}${DELIMITER}${DEFAULT_USER_ID}${DELIMITER}`,
    endKey: `${FLOW}${DELIMITER}${DEFAULT_USER_ID}${DELIMITER}\uffff`,
    key: query.name
  };

  // TODO:  repplace with a persistent query: https://pouchdb.com/guides/queries.html
  return _dbService.db
    .query(function(doc, emit) { emit(doc.name); }, options)
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

function createFlow(flowObj){
  return new Promise((resolve, reject)=>{
    _dbService.create(flowObj).then((response)=>{
      resolve(response);
    }).catch((err)=>{
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

}

function* getFlows(next){
  console.log("getFlows, next: ", next);
  //this.body = 'getFlows';

  let data = [];
  if (!_.isEmpty(this.query)) {
    data = yield filterFlows(this.query);
  } else {
    data = yield getAllFlows();
  }
  //yield next;
  console.log(data);
  this.body = data;
}

function* createFlows(next){
  console.log("createFlows");
  try{
    let data = this.request.body||{};
    if(typeof this.request.body == 'string'){
      if(isJson(this.request.body)){
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
    console.log(flowObj);
    let res = yield createFlow(flowObj);
    this.body = res;
  }catch(err){
    var error = {
      code: 500,
      message: err.message
    };
    this.body = error;
  }
}

function* deleteFlows(next){
  console.log("deleteFlows");
  this.body = 'deleteFlows';
  yield next;
}

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


function _activitySchemaToTrigger(schema) {
  return {
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    activityType: _.get(schema, 'name', ''),
    name: _.get(schema, 'name', ''),
    version: _.get(schema, 'version', ''),
    title: _.get(schema, 'title', ''),
    description: _.get(schema, 'description', ''),
    settings: _.get(schema, 'settings', ''),
    outputs: _.get(schema, 'outputs', ''),
    endpoint: { settings: _.get(schema, 'endpoint.settings', '') }
  }
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


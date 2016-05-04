import {config} from '../../config/app-config';
import {DBService} from '../../common/db.service';
import {isJson, flogoIDEncode, flogoIDDecode, flogoGenTaskID, genNodeID} from '../../common/utils';
import {FLOGO_FLOW_DIAGRAM_NODE_TYPE, FLOGO_TASK_TYPE} from '../../common/constants';
import _ from 'lodash';

let basePath = config.app.basePath;
let dbDefaultName = config.db;
let _dbService = new DBService(dbDefaultName);
let FLOW = 'flows';
let DELIMITER = ":";
let DEFAULT_USER_ID = 'flogoweb-admin';

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
  //TODO validate this query is json
  var data = _.assign({},this.request.body || {}, this.query);
  let triggerId = flogoGenTaskID();

  let trigger = yield _getTriggerByName(data.name);
  if(trigger) {
    trigger = _activitySchemaToTrigger(trigger.schema);
  }
  let flow = yield _getFlowById(data.flowId);


  let response = {status : 400};
  if(flow && trigger) {
    var nodeID = genNodeID();
    flow.paths = _.assign({}, {root:{is:nodeID}});

    flow.paths['nodes'] = flow.paths['nodes'] || {};
    flow.paths['nodes'][nodeID] = {
      id: nodeID,
      taskID: triggerId,
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
      children: [],
      parents: []
    };


    // attach the trigger to the flow
    trigger.id = triggerId;
    let items = {};
    items[triggerId] = trigger;
    flow["items"] = items;


    let updateResponse = yield updateFlow(flow);

    if(updateResponse&&updateResponse.ok && updateResponse.ok == true) {
      response.status = 200;
      response.id = updateResponse.id;
      response.name = flow.name || '';
    }
  } else {
    this.throw('Not found', 400);
  }

  this.body = response;
}

function * addActivity(next){
  console.log("addActivity");
  this.body = 'addActivity';
  yield next;
}

/**
 *
 * @param triggerName: string
 * @returns {*}
 */
function _getTriggerByName(triggerName) {
  let _dbTrigger = new DBService(config.triggers.db);
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


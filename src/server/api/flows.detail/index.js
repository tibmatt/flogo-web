import {config, dbService, triggersDBService, engines} from '../../config/app-config';
import {DBService} from '../../common/db.service';
import {flogoFlowToJSON} from '../../common/flow.model';
import {flogoIDDecode, findLastCreatedFile, writeJSONFileSync} from '../../common/utils';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import fse from 'fs-extra'

let basePath = config.app.basePath;

let _dbService = dbService;

//TODO provide more common
function getFlatObj(arr){
  let obj = {};
  for(let i = 0; i<arr.length; i++){
    let item = arr[i];
    if(!item.name){
      continue;
    }
    obj[item.name] = item.value;
  }

  return obj;
}

function generateTriggerJSON(doc, flowName){
  // for now each flow just can has one trigger
  let trigger = {
    name: '',
    endpoints: null,
    settings: null
  };
  let key = _.findKey(doc.items, function(o){return o&&o.triggerType});
  let triggerItem = doc.items[key];
  // For now, triggers.json just has name, settings, endpoints
  trigger.name = triggerItem.triggerType;
  let settings = triggerItem.settings;
  if(_.isArray(settings)){
    trigger.settings = getFlatObj(settings);
  }else{
    trigger.settings = settings;
  }

  trigger.endpoints = [];

  let keys = _.keys(triggerItem.endpoint);
  let endpoint = {};
  keys.forEach((key)=>{
    if(_.isArray(triggerItem.endpoint[key])){
      endpoint[key] = getFlatObj(triggerItem.endpoint[key]);
    }else{
      endpoint[key] = triggerItem.endpoint[key];
    }
  });

  // TODO this is temp solution
  endpoint.actionType = 'flow';
  endpoint.actionURI = `embedded://${flowName}`;
  endpoint.flowURI = endpoint.actionURI;

  trigger.endpoints.push(endpoint);

  console.log("[info]generateTriggerJSON, trigger: ", trigger);
  return trigger;
}

function _determineBuildExecutableNamePattern(name, compileOptions) {
  let executableName = name;
  if(compileOptions.os && compileOptions.arch) {
    executableName = `${executableName}-${compileOptions.os}-${compileOptions.arch}`;
  } else if (compileOptions.os) {
    executableName = `${executableName}-${compileOptions.os}`;
  } else if (compileOptions.arch) {
    executableName = `${executableName}-.*-${compileOptions.arch}`;
  }
  return executableName;
}

function generateBuild(id, compileOptions){
  compileOptions = compileOptions || {};
  return new Promise((resolve, reject)=> {
    console.log('generateBuild');

    let flowID = flogoIDDecode(id);
    console.log('id: ', id);
    console.log('flowID: ', flowID);
    _dbService.db.get(flowID).then((doc)=>{
      console.log(doc);

      let flowJSON = flogoFlowToJSON(doc);
      console.log(flowJSON);

      if(engines.build){
        console.log("build engine, build.enginePath", engines.build.enginePath);
        let engineFolderPath = path.join(engines.build.enginePath, engines.build.options.name);

        // step1: add flow.json
        let tmpFlowJSONPath = path.join(config.rootPath, 'tmp', 'flow.json');
        fse.outputJSONSync(tmpFlowJSONPath, flowJSON.flow);
        engines.build.deleteAllFlows();
        let flowName = engines.build.addFlow('file://'+tmpFlowJSONPath);
        // step2: update config.json
        engines.build.updateConfigJSON(config.buildEngine.config, true);
        // step3: update trigger.json
        let triggerJSON = generateTriggerJSON(doc, flowName);

        let triggersJSON = {
          "triggers": [
          ]
        };
        triggersJSON.triggers.push(triggerJSON);
        engines.build.updateTriggerJSON(triggersJSON, true);

        // step4: build
        engines.build.build( {
          optimize: true,
          incorporateConfig: true,
          compile: compileOptions
        } )
          .then( ()=> {
            // setp 5: return file
            let binPath = path.join( engineFolderPath, 'bin' );
            let executableName = _determineBuildExecutableNamePattern( engines.build.options.name, compileOptions );
            console.log( `[log] execName: ${executableName}` );
            // if no compile options provided or both options provided we can skip the search for generated binary since we have the exact name
            let isDefaultCompile = !compileOptions.os && !compileOptions.arch;
            if ( isDefaultCompile || (compileOptions.os && compileOptions.arch) ) {
              console.log( '[debug] Default compile, grab file directly' );
              let data = fs.readFileSync( path.join( binPath, executableName ) );
              return resolve( data );
            } else {
              console.log( '[debug] Find file' );
              return findLastCreatedFile( binPath, new RegExp( executableName ) )
                .then( buildEnginePath => {
                  console.log( '[log] Found: ' + JSON.stringify( buildEnginePath ) );
                  let data = fs.readFileSync( buildEnginePath );
                  resolve( data );
                } );
            }
          } )
          .catch( reject );
      }else{
        reject(err);
      }

    }).catch((err)=>{
      reject(err);
    })
  });
}

export function flowsDetail(app, router){
  if(!app){
    console.error("[Error][api/flows.detail/index.js]You must pass app");
  }
  router.get(basePath+"/flows/:id/build", getBuild);
}

/**
 * @swagger
 *  /flows/{flowId}/build:
 *    get:
 *      tags:
 *        - Flow
 *      summary: Builds the flow for external usage.
 *      parameters:
 *        - name: flowId
 *          in: path
 *          required: true
 *          type: string
 *          description: Encoded ID required for the Flow Building
 *      responses:
 *        200:
 *          description: Flow built successfully
 */
function* getBuild(next){

  console.log("getBuild");

  //let engineDirPath = path.resolve(config.rootPath, config.testEngine.path);
  //engineDirPath = path.join(engineDirPath, config.testEngine.name);
  //let engineFilePath = path.join(engineDirPath, 'bin', config.testEngine.name);
  //
  //let data = fs.readFileSync(engineFilePath);

  //console.log("data: ", data);
  let id = this.params.id;

  let compileOptions;
  // TODO: make sure os and arch are valid
  if (this.query.os || this.query.arch) {
    compileOptions = {
      os: this.query.os,
      arch: this.query.arch
    };
  }

  let data = yield generateBuild(id, compileOptions);

  //data = yield _dbService.allDocs({ include_docs: true })
  //  .then(res => res.rows || [])
  //  .then(rows => rows.map(row => row.doc ? _.pick(row.doc, ['_id', 'name', 'version', 'description']) : []));
  //
  //console.log(data);
  this.body = data;
  yield next;
}

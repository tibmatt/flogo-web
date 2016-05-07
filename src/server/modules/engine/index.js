import path from 'path';
import fs from 'fs';
import _ from 'lodash';

import {config, activitiesDBService, triggersDBService} from '../../config/app-config';
import {isExisted} from '../../common/utils';
import {DBService} from '../../common/db.service';

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
//const execFileSync = require('child_process').execFileSync;

export class Engine {
  constructor(options){
    // Get the path to engine
    this.options = _.cloneDeep(options);
    this.enginePath = path.join(config.rootPath, this.options.path);
    this.removeEngine();
    this.createEngine();
  }

  removeEngine(){
    try{
      let port = this.options.port;
      let engineFolder = path.join(this.enginePath, this.options.name);
      // if engine is running stop it
      execSync(`lsof -i:${port} | grep node | awk '{print $2}' | xargs kill -9`);
      // remove the engine folder
      if(isExisted(engineFolder)){
        execSync(`rm -rf ${engineFolder}`);
      }
      return true;
    }catch (err){
      console.error("[Error]Engine->removeEngine. Error: ", err);
      return false;
    }
  }

  createEngine(){
    try{
      execSync(`flogo create ${this.options.name}`, {cwd: this.enginePath});
    }catch (err){
      console.error("[Error]Engine->createEngine. Error: ", err);
      return false;
    }
  }

  addAllActivities(options){
    return new Promise((resolve, reject)=>{
      activitiesDBService.allDocs().then((result)=>{
        //console.log("[info]addAllActivities, result", result);
        result ? result: (result=[]);
        options ? options: (options={});

        result.forEach((item)=>{
          item ? item: (item={});
          let ignore = options[item.name]&&options[item.name].ignore||false;
          if(item.where){
            if(!ignore){
              this.addActivity(item.where);
            }else{
              console.log("[info] ignore");
            }
          }else{
            console.error("[error]", item.name, " where isn't defined");
          }
        });

        resolve(true);
      }).catch((err)=>{
        console.error("[error]activitiesDBService.allDocs(), err: ", err);
        reject(err);
      });
    });
  }

  addAllTriggers(options){
    return new Promise((resolve, reject)=>{
      triggersDBService.allDocs().then((result)=>{
        //console.log("[info]triggersDBService, result", result);
        result ? result: (result=[]);
        options ? options: (options={});

        result.forEach((item)=>{
          item ? item: (item={});
          let ignore = options[item.name]&&options[item.name].ignore||false;
          if(item.where){
            if(!ignore){
              this.addTrigger(item.where);
            }else{
              console.log("[info] ignore");
            }
          }else{
            console.error("[error]", item.name, " where isn't defined");
          }
        });

        resolve(true);
      }).catch((err)=>{
        console.error("[error]triggersDBService.allDocs(), err: ", err);

        reject(err);
      });
    });
  }

  addActivity(activityPath){
    try{
      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`flogo add activity ${activityPath}`);
      execSync(`flogo add activity ${activityPath}`, {cwd: defaultEnginePath});
      return true;
    }catch (err){
      console.error("[Error]Engine->addActivity. Error: ", err);
      return false;
    }
  }

  addTrigger(triggerPath){
    try{
      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`flogo add trigger ${triggerPath}`);
      execSync(`flogo add trigger ${triggerPath}`, {cwd: defaultEnginePath});
      return true;
    }catch (err){
      console.error("[Error]Engine->addTrigger. Error: ", err);
      return false;
    }
  }

  addModel(modelPath){
    try{
      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`flogo add model ${modelPath}`);
      execSync(`flogo add model ${modelPath}`, {cwd: defaultEnginePath});
      return true;
    }catch (err){
      console.error("[Error]Engine->addModel. Error: ", err);
      return false;
    }
  }

  build(){
    try{
      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      execSync(`flogo build -i`, {cwd: defaultEnginePath});
      return true;
    }catch (err){
      console.error("[Error]Engine->build. Error: ", err);
      return false;
    }
  }

  config(){
    // config config.json
    let defaultEngineBinPath =  path.join(this.enginePath, this.options.name, 'bin');
    fs.writeFileSync(path.join(defaultEngineBinPath, 'config.json').toString(), JSON.stringify(this.options.config, null, 2), {"encoding": "utf8"});

    // config triggers.json
    let data = fs.readFileSync(path.join(defaultEngineBinPath, 'triggers.json'), {"encoding": "utf8"});
    //console.log("=======triggers.json: ", data);
    let triggersJSON = JSON.parse(data);
    //console.log(triggersJSON);
    let triggers = triggersJSON.triggers||[];
    let triggersConfig = this.options.triggers;
    let newTriggers = [];
    let newTriggersJSON = {};
    //console.log("triggers: ", triggers);
    triggers.forEach((trigger, index)=>{
      //console.log(trigger);
      if(triggersConfig[trigger&&trigger.name||'']){
        newTriggers.push(triggersConfig[trigger&&trigger.name||'']);
      }
    });

    newTriggersJSON.triggers = newTriggers;
    //console.log(newTriggersJSON);
    fs.writeFileSync(path.join(defaultEngineBinPath, 'triggers.json').toString(), JSON.stringify(newTriggersJSON, null, 2), {"encoding": "utf8"});
  }

  start(){
    try{
      console.log("[info]start");
      let defaultEngineBinPath =  path.join(this.enginePath, this.options.name, 'bin');
      console.log("[info]defaultEngineBinPath: ", defaultEngineBinPath);
      let command = "./"+this.options.name+" &";
      console.log("[info]command: ", command);
      exec(command, {cwd: defaultEngineBinPath});

      //execFileSync(command,[], {cwd: defaultEngineBinPath});

      return true;
    }catch (err){
      console.error("[Error]Engine->start. Error: ", err);
      return false;
    }
  }
}

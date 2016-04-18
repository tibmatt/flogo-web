import {config} from '../../config/app-config';
import path from 'path';
import {isExisted} from '../../common/utils'

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const spawn = require('child_process').spawn;

export class Engine {
  constructor(){
    // Get the path to engine
    this.enginePath = path.join(config.rootPath, config.engine.path);
    this.removeEngine();
    this.createEngine();
  }

  removeEngine(){
    try{
      let port = config.engine.port;
      let engineFolder = path.join(this.enginePath, config.engine.name);
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
      execSync(`flogo create ${config.engine.name}`, {cwd: this.enginePath});
    }catch (err){
      console.error("[Error]Engine->createEngine. Error: ", err);
      return false;
    }
  }

  addActivity(){

  }

  addTrigger(){

  }

  addModel(){

  }
}

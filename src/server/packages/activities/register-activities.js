import Pouchdb from 'pouchdb';
import path from 'path';
import npm from 'npm';
import _ from 'lodash';

let db = new Pouchdb("http://localhost:5984/flogo-web-activities");
db.info().then((response)=>{
  console.log(response);
}).catch((err)=>{
  console.error(err);
});
// console.log(__dirname);
// let p = path.resolve(__dirname, '../../../../packages/activities/tibco-pet-query');
// console.log(p);

export class RegisterActivities{
  constructor(){
    console.log("constructor of RegisterActivities");
    this.install();
  }

  /**
   * @callback npmLoadCallback
   * @params {Object} err - If has error, will pass error object back
   */
  /**
   * npm.load() must be called before any other function call. Create a common function for this
   * @param {npmLoadCallback} callback
   */
  npmLoad(callback){
    npm.load({}, function(err){
      if(err) throw new Error(err);
      callback();
    });
  }

  install(){
    this.npmLoad(function(){
      // Store current working directory
      let packageJSONPath = '/Users/shaoke/SK/TIBCO/Projects/flogo/flogo-web/dist/server/packages/activities';
      var currentCWD = process.cwd();
      console.log("currentCWD: ", currentCWD);
      process.chdir(packageJSONPath);
      npm.commands.install(packageJSONPath, [], function(err, result){
        // Change current working directory back
        process.chdir(currentCWD);
        if(err){
          // deferred.reject(err);
          console.log(err);
        }else{
          // deferred.resolve(result);
          console.log("success: ", result);
        }
      });
    });
  }
}

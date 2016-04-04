import Pouchdb from 'pouchdb';
import path from 'path';
import npm from 'npm';
import _ from 'lodash';
import fs from 'fs';

let db = new Pouchdb("http://localhost:5984/flogo-web-activities");
let ACTIVITIES = 'activity';
let DELIMITER = ":";

db.info().then((response)=>{
  // console.log(response);
}).catch((err)=>{
  // console.error(err);
});

function generateActivityID(name, version){
  console.log("generateActivityID, arguments: ", arguments);
  name = _.kebabCase(name);
  console.log("name: ", name);
  // TODO need to think about how to versionable activity
  version = _.kebabCase(version);
  console.log("version: ", version);
  // let id = this.ACTIVITIES+this.DELIMITER+name+this.DELIMITER+version;
  let id = name;
  console.log("generateActivityID, id: ", id);
  return id;
}

let packageJSONPath = '/Users/shaoke/SK/TIBCO/Projects/flogo/flogo-web/dist/server/packages/activities';
// console.log(__dirname);
// let p = path.resolve(__dirname, '../../../../packages/activities/tibco-pet-query');
// console.log(p);

export class RegisterActivities{
  constructor(){
    console.log("constructor of RegisterActivities");
    // TODO need to improve the install
    // Step 1: install all the packages
    this.install().then((resolve, reject)=>{
      // Step 2: update the db
      let packageJSON = JSON.parse(fs.readFileSync(path.join(packageJSONPath, 'package.json'), 'utf8'));
      // console.log(packageJSON);
      let dependencies = packageJSON.dependencies;

      _.forOwn(dependencies, (value, key)=>{
        console.log('value: ', value);
        console.log('key: ', key);
        let packageJSON = JSON.parse(fs.readFileSync(path.join(packageJSONPath, 'node_modules', key, 'package.json'), 'utf8'));
        let schemaJSON = JSON.parse(fs.readFileSync(path.join(packageJSONPath, 'node_modules', key, 'schema.json'), 'utf8'));

        // console.log("packageJSON: ", packageJSON);
        // console.log("schemaJSON: ", schemaJSON);

        let id = generateActivityID(key, packageJSON.version);
        console.log("id: ", id);
        let activityDoc = {
          _id: id,
          'name': key,
          'version': packageJSON.version,
          'description': packageJSON.description,
          'keywords': packageJSON.keywords||[],
          'schema': schemaJSON
        };
        console.log("activityDoc: ", activityDoc);

        db.get(id).then((doc)=>{
          console.log(doc);
          activityDoc.updated_at = new Date().toISOString();
          activityDoc = _.merge(doc, activityDoc);
          console.log("update activityDoc: ", activityDoc);
          db.put(activityDoc).then((response)=>{
            console.log("Update activity success: ", response);
          }).catch((err)=>{
            console.log("Update activity error: ", err);
          })
        }).catch((err)=>{
          console.log(err);
          if(err&&err.status == 404){
            activityDoc.created_at = new Date().toISOString();
            console.log("new activityDoc: ", activityDoc);
            db.put(activityDoc).then((response)=>{
              console.log("Add activity success: ", response);
            }).catch((err)=>{
              console.log("Add activity error: ", err);
            })
          }
        })

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
  npmLoad(callback){
    npm.load({}, function(err){
      if(err) throw new Error(err);
      callback();
    });
  }

  install(){
    return new Promise((resolve, reject)=>{
      this.npmLoad(function(){
        // Store current working directory
        var currentCWD = process.cwd();
        console.log("currentCWD: ", currentCWD);
        process.chdir(packageJSONPath);
        npm.commands.install(packageJSONPath, [], function(err, result){
          // Change current working directory back
          process.chdir(currentCWD);
          if(err){
            reject(err);
            // console.log(err);
          }else{
            resolve(result);
            // console.log("success: ", result);
          }
        });
      });
    });
  }
}

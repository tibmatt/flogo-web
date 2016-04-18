import Pouchdb from 'pouchdb';
import path from 'path';
import npm from 'npm';
import _ from 'lodash';
import fs from 'fs';
import {DBService} from '../../common/db.service';
import {config} from '../../config/app-config';
import {isDirectory, isExisted} from '../../common/utils';

// TODO trigger and activity register is same, should merge to one

// TODO DB Name should pass from options
// The database for activities
// let dbDefaultName = "http://localhost:5984/flogo-web-activities";
let dbDefaultName = config.triggers.db;
// TODO the path should pass from options
// The folder which contains all activities
// let activitiesDefaultPath = "../../../../packages/activities";
let activitiesDefaultPath = config.triggers.path;

function generateActivityID(name, version){
  // console.log("generateActivityID, arguments: ", arguments);
  name = _.kebabCase(name);
  // console.log("name: ", name);
  // TODO need to think about how to versionable activity
  version = _.kebabCase(version);
  // console.log("version: ", version);
  // let id = this.ACTIVITIES+this.DELIMITER+name+this.DELIMITER+version;
  let id = name;
  console.log("generateActivityID, id: ", id);
  return id;
}

export class RegisterTriggers{
  constructor(dbName, engine, options){
    this._dbService = new DBService(dbName||dbDefaultName);
    this._engine = engine;
    // folder store activities package.json
    this._packageJSONFolderPath = path.resolve(__dirname, '.');
    // activities package.json path
    this._packageJSONTplFilePath = path.join(this._packageJSONFolderPath, 'package.tpl.json');
    this.activitiesPath = options&&options.activitiesPath || activitiesDefaultPath;
    //this.activitiesAbsolutePath = path.resolve(__dirname, this.activitiesPath);
    this.activitiesAbsolutePath = path.resolve(config.rootPath, this.activitiesPath);

    console.log("this.activitiesAbsolutePath: ", this.activitiesAbsolutePath);

    // read the package.json template, will use this template to generate package.json
    try{
      let data = fs.readFileSync(this._packageJSONTplFilePath, {"encoding": "utf8"});
      this.packageJSONTemplate = JSON.parse(data);
      // console.log("????????[packageJSONTemplate]: ", this.packageJSONTemplate);
    }catch(err){
      console.error("[error]Read package.json template error. ", err);
    }

    this.updateActivitiesDB();

    // start watch files/folder changes
    //this.watch();
  }

  get dbService(){
    return this._dbService;
  }
  // watch the activities
  watch(){
    this.updateActivitiesDB();
    // continue watch and also watch te sbudirectories
    let watchOptions = {
      persistent: true,
      recursive: true
    };

    // start watch the change in activities folder
    fs.watch(this.activitiesAbsolutePath, watchOptions, (event, filename)=>{
      // console.log("========event: ", event);
      // console.log("========filename: ", filename);
      this.updateActivitiesDB();
    });
  }

  findActivityDesignFolder(activityPath){

  }


  /**
   * install all activities in the activitiesPath
   */
  updatePackageJSON(){
    let packageJSON = _.cloneDeep(this.packageJSONTemplate);
    packageJSON.dependencies = {};
    // get all the activity package in activitiesPath
    let dirs = fs.readdirSync(this.activitiesAbsolutePath);
    if(dirs){
      // console.log("???????dirs", dirs);
      dirs.forEach((dir, index)=>{
        //// console.log(value);
        //let stats = fs.statSync(path.join(this.activitiesAbsolutePath, value));
        //// if it is a directory, then assume it is a activity package.
        //// TODO add more validate, make sure it is a activity package.
        //if(stats.isDirectory()){
        //  packageJSON.dependencies[value] = path.join(this.activitiesPath, value);
        //}
        console.log("=====dir", dir);
        let activityPath = path.join(this.activitiesAbsolutePath, dir);
        console.log("activityPath: ", activityPath);
        // Add activity to engine
        this._engine.addTrigger("file://"+activityPath);

        let design_package_json=null;
        let value = null;

        // TODO need to improve, provide more good way

        if(isExisted(path.join(activityPath, 'design', 'package.json'))){
          design_package_json = path.join(activityPath, 'design', 'package.json');
          value = path.join(activityPath, 'design');
        }else if(isExisted(path.join(activityPath, 'src', 'design', 'package.json'))){
          design_package_json = path.join(activityPath, 'src', 'design', 'package.json');
          value = path.join(activityPath, 'src', 'design');
        }else{
          console.log("[Warning] didn't find design time for this activity");
        }

        if(design_package_json){
          let data = fs.readFileSync(design_package_json, {"encoding": "utf8"});
          let designPackageJSONData = JSON.parse(data);
          if(designPackageJSONData.name){
            packageJSON.dependencies[designPackageJSONData.name] = path.join(value);
          }
        }

      });
      // console.log("++++++packageJSON: ", packageJSON);
      let JSONStr = JSON.stringify(packageJSON, null, 2);
      fs.writeFileSync(path.join(this._packageJSONFolderPath, 'package.json').toString(), JSONStr, {"encoding": "utf8"});
    }else{
      console.error("[error]updatePackageJSON. ", err);
    }

    return packageJSON;
  }

  updateActivitiesDB(){
    // update activity package.json
    let packageJSON = this.updatePackageJSON();
    // console.log(packageJSON);
    let dependencies = packageJSON.dependencies;
    // new activities generate from package.json
    let activityDocs = {};

    // install all activity packages
    this.install().then(()=>{

      // generate all the activity docs
      _.forOwn(dependencies, (value, key)=>{
        let packageJSON = JSON.parse(fs.readFileSync(path.join(this._packageJSONFolderPath, 'node_modules', key, 'package.json'), 'utf8'));
        let schemaJSON = JSON.parse(fs.readFileSync(path.join(this._packageJSONFolderPath, 'node_modules', key, 'trigger.json'), 'utf8'));
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

        activityDocs[id]=activityDoc;
      });

      // console.log("!!!!!!!!activityDocs: ", activityDocs);

      this.dbService.db.allDocs({include_docs: true}).then((docs)=>{
        // console.log("============ - docs: ", docs);
        let rows = docs.rows||[];
        let activities = [];

        rows.forEach((item, index)=>{
          if(item&&item.doc){
            activities.push(item.doc);
          }
        });
        // update or remove activity
        activities.forEach((activity, index)=>{
          let newActivity = activityDocs[activity['_id']];
          // console.log("activity['id']: ", activity['id']);
          // console.log("**********newActivity: ", newActivity);
          // if this activity cannot find in activityDocs generate from package.json, then need to remove it
          if(!newActivity){
            // console.log("[Remove]activity: ", activity);
            this.dbService.db.remove(activity).then((response)=>{
              console.log("[info]delete activity success. ", response);
            }).catch((err)=>{
              console.error("[error]delete activity fail. ", err);
            });
          }else{
            // When we update an activity, we will use new activity to overwrite the old one. This is because, user maybe in new activity delete some value,
            // copy the some value from current activity in DB
            newActivity['_id'] = activity['_id'];
            newActivity['_rev'] = activity['_rev'];
            newActivity.created_at = activity.created_at;
            newActivity.updated_at = new Date().toISOString();
            // update this activity in DB
            this.dbService.db.put(_.cloneDeep(newActivity)).then((response)=>{
              console.log("Update activity success: ", response);
            }).catch((err)=>{
              console.log("Update activity error: ", err);
            });
            // delete this activity
            delete activityDocs[activity['_id']];
          }
        });

        // console.log("@@@@@@@@@[activityDocs]: ", activityDocs);

        // Rest activities should be new activity
        _.forOwn(activityDocs, (activity, index)=>{
          activity.created_at = new Date().toISOString();
          // add this activity in DB
          this.dbService.db.put(activity).then((response)=>{
            console.log("Add activity success: ", response);
          }).catch((err)=>{
            console.log("Add activity error: ", err);
          });
        });
      }).catch((err)=>{
        console.log("[error]Get all activities fail. ", err);
      });


    }).catch((err)=>{
      console.error("[error]Install error. ", err);
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
      this.npmLoad(()=>{
        // Store current working directory
        var currentCWD = process.cwd();
        console.log("currentCWD: ", currentCWD);
        process.chdir(this._packageJSONFolderPath);
        npm.commands.install(this._packageJSONFolderPath, [], (err, result)=>{
          // Change current working directory back
          process.chdir(currentCWD);
          if(err){
            reject(err);
            console.log(err);
          }else{
            resolve(result);
            console.log("success: ", result);
          }
        });
      });
    });
  }
}

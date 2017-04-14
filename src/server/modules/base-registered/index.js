import path from 'path';
import npm from 'npm';
import _ from 'lodash';
import fs from 'fs';
import {DBService} from '../../common/db.service';
import {DatabaseService} from '../../common/database.service';
import { fileExists, readDirectoriesSync} from '../../common/utils';
import {config} from '../../config/app-config';
import { DEFAULT_SCHEMA_ROOT_FOLDER_NAME } from '../../common/constants';
import { logger } from '../../common/logging';

const execSync = require('child_process').execSync;

// default options
const defaultOptions = {
  path: 'modules/base-registered',
  jsonTplName: 'package.tpl.json',
};

/**
 * Base class of registered
 */
export class BaseRegistered{
  /**
   * constructor function
   * @param {string||DBService} dbName - db name or an instance of DBService. it can be local or remote db
   * @param {Object} options
   * @param {Object} options.type - currently registered type, it can be trigger, activity, model
   * @param {string} options.defaultPath - the default path that store activity or trigger or model develop by Flogo team
   * @param {Object} [options.defaultConfig] - by default, we will install it from local file system, but you can use this to overwrite. {'folder_name': 'path'}
   * @param {string} options.customPath - the custom path that store activity or trigger or model develop by contributor
   * @param {Object} [options.customConfig] - by default, we will install it from local file system, but you can use this to overwrite. {'folder_name': 'path'}
   * @param {string} [options.path='modules/base-registered'] - path relative to root folder.
   * @param {string} [options.jsonTplName='package.tpl.json'] - package.json template file name.
   * @param {string} options.schemaJsonName - The name of schema json
   */
  constructor(dbName, options){

    if(!dbName){
      throw "dbName is required";
    }



    this._options = _.merge({}, defaultOptions, options);

    // store db information
    if(_.isString(dbName)){
      this._dbService = new DBService(dbName);
    }else if(_.isObject(dbName)&&(dbName instanceof DBService || dbName instanceof DatabaseService)){
      this._dbService = dbName;
    }else{
      throw "dbName is required, and it should be a name of DB or an instance of DBService";
    }

    // folder store package.json
    this._packageJSONFolderPath = path.resolve(config.rootPath, this._options.path);
    // package.tpl.json path
    this._packageJSONTplFilePath = path.join(this._packageJSONFolderPath, this._options.jsonTplName);

    // read the package.json template, will use this template to generate package.json
    let data = fs.readFileSync(this._packageJSONTplFilePath, {"encoding": "utf8"});
    this.packageJSONTemplate = JSON.parse(data);

    // store the path of runtime(activity runtime, trigger runtime)
    this._where = [];
  }



  register(){
    return new Promise((resolve, reject)=>{
      this.clean().then(() => {
        logger.info('clean success!, type: ', this._options.type);
        this.updateDB().then(() => {
          resolve(true);
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        logger.error('clean fail!, type: ', this._options.type);
        reject(err);
      });
    });
  }

  get dbService(){
    return this._dbService;
  }

  static generateID(name, version){
    // console.log("generateActivityID, arguments: ", arguments);
    name = _.kebabCase(name);
    // console.log("name: ", name);
    // TODO need to think about how to versionable activity
    version = _.kebabCase(version);
    // console.log("version: ", version);
    // let id = this.ACTIVITIES+this.DELIMITER+name+this.DELIMITER+version;
    let id = name;
    //console.log("generateID, id: ", id);
    return id;
  }

  static constructItem( opts ) {
    return {
      _id : opts.id,
      'ref' : opts.ref,
      'name' : opts.name,
      'version' : opts.version,
      'description' : opts.description,
      'keywords' : opts.keywords || [],
      'author' : opts.author || 'Anonymous',
      'schema' : opts.schema
    }
  }

  static saveItemsNewDatabase( dbService, items ) {
    let _items = _.cloneDeep( items ); // in order to avoid the changes on the given items.
    let toInsert = [];

    for(let key in _items) {
      _items[key].createdAt = new Date().toISOString();
      _items[key].updatedAt = new Date().toISOString();

      toInsert.push(_items[key]);
    }
    return dbService.db.insertBulk(toInsert);
  }


  static saveItems( dbService, items, updateOnly ) {
    if(dbService instanceof DatabaseService) {
      return BaseRegistered.saveItemsNewDatabase(dbService, items);
    }

    let _items = _.cloneDeep( items ); // in order to avoid the changes on the given items.
    // get all of the items in the given db
    return dbService.db.allDocs( { include_docs : true } )
      .then( ( docs )=> {
        logger.verbose('Get all items.');
        return docs;
      } )
      // pre-process the docs
      .then( ( docs ) => {
        logger.verbose('pre-process the docs');
        return _.map( docs.rows, ( row ) => {
          return (row && row.doc) || null;
        } );
      } )
      .then( ( itemDocs ) => {
        return _.filter( itemDocs, itemDoc => !_.isNull( itemDoc ) && itemDoc._id !== '_design/views' );
      } )

      // update or remove item
      // `updateOnly` will skip the `remove other items` part.
      .then( ( oldItems ) => {
        logger.verbose('update or remove item');

        return Promise.all( _.map( oldItems, ( oldItem ) => {

          let newItem = _items[ oldItem[ '_id' ] ];

          // if this item cannot be found in the activityDocs generated from package.json, then need to be removed
          if ( !newItem ) {
            if ( updateOnly ) {
              logger.verbose(`ignore existing item [${oldItem[ 'where' ]}] for updating only.`);
              return null;
            }
            return dbService.db.remove( oldItem )
              .then( ( result ) => {
                logger.verbose(`delete item [${oldItem[ 'where' ]}] success.`);
                return result;
              } )
              .catch( ( err )=> {
                logger.error('delete item fail.', err );
                throw err;
              } );
          } else {
            // update the item.

            // When updating an item, the old one will be overwritten,
            // since the user maybe delete some value in the new one.

            // copy the some value from current activity in DB
            newItem[ '_id' ] = oldItem[ '_id' ];
            newItem[ '_rev' ] = oldItem[ '_rev' ];
            newItem.createdAt = oldItem.createdAt;
            newItem.updatedAt = new Date().toISOString();

            // update this item in DB
            return dbService.db.put( _.cloneDeep( newItem ) )
              .then( ( response )=> {
                logger.verbose(`update item [${newItem[ 'where' ]}] success.`);
                return response;
              } )
              .then( ( result ) => {
                // delete this item from the given list.
                delete _items[ oldItem[ '_id' ] ];
                return result;
              } )
              .catch( ( err )=> {
                logger.error(`[error] Update item [${newItem[ 'where' ]}] error: `, err);
                throw err;
              } );
          }
        } ) );

      } )
      // filter undefined && null
      .then( ()=> _.filter( _items, _item => !_.isNil( _items ) ) )

      // add new items
      .then( ( newItems )=> {
        logger.verbose('add new items');

        return Promise.all( _.map( newItems, ( newItem ) => {
          newItem.createdAt = new Date().toISOString();

          return dbService.db.put( newItem )
            .then( ( response )=> {
              logger.verbose(`Add item [${newItem[ 'where' ]}] success.`);
              return response;
            } )
            .catch( ( err )=> {
              logger.error(`[error] Add item [${newItem[ 'where' ]}] error: `, err);
              throw err;
            } );
        } ) );
      } )

      // done with true
      .then( () => true )
      .catch( ( err ) => {
        logger.error( `Error in saveItems:\n${ err }` );
        throw err;
      } );
  }


  clean(){
    return new Promise((resolve, reject)=>{
      this.cleanDB(true)
        .then((result)=>{
          return this.cleanNodeModules();
        })
        .then((result)=>{
          resolve(true);
        })
        .catch((err)=>{
          reject(false);
        });
    });
  }

  cleanDB(ignoreViews){
    if(this._dbService instanceof DatabaseService) {
      return this._dbService.db.removeAll();
    }

    return new Promise((resolve, reject)=>{
      this._dbService.db.allDocs({include_docs: true}).then((result)=>{
        logger.verbose('cleanDB, type: ', this._options.type);
        let docs = result&&result.rows||[];
        let deletedDocs = [];

        if(ignoreViews) {
          docs = docs.filter(doc => {
            return doc.id !== '_design/views';
          });
        }

        if (docs.length === 0) {
          logger.verbose('cleanDB finished!, empty docs type: ', this._options.type);
          resolve(result);
        }

        docs.forEach((item)=>{
          //doc._deleted = true;
          let doc = item&&item.doc;
          if(doc){
            doc._deleted = true;
            deletedDocs.push(doc);
          }
        });

        //console.log(deletedDocs);
        this._dbService.db.bulkDocs(deletedDocs).then((result)=>{
          logger.verbose('cleanDB finished!, type: ', this._options.type);
          resolve(result);
        }).catch((err)=>{
          reject(err);
          logger.error('[error]cleanDB error!, update docs error! type: ', this._options.type, err);
        });

      }).catch((err)=>{
        logger.error('[error]cleanDB error!, get docs error! type: ', this._options.type, err);
        logger.error(err);
      });
    });
  }

  cleanNodeModules(){
    return new Promise((resolve, reject)=>{
      try {
        let nodeModulesPath = path.join(this._packageJSONFolderPath, 'node_modules');
        if(fileExists(nodeModulesPath)){
          execSync(`rm -rf ${nodeModulesPath}`);
        }
        logger.verbose('[Success]cleanNodeModules finished!, type: ', this._options.type);
        resolve(true);
      } catch (err) {
        logger.error('[error]cleanNodeModules error!, type: ', this._options.type);
        reject(false);
      }
    });
  }

  /**
   *
   */
  updatePackageJSON(dirPath, config, sourcePackageJSON){
    logger.debug('updatePackageJSON');
    let packageJSON = _.cloneDeep(sourcePackageJSON);
    !packageJSON.dependencies ? (packageJSON.dependencies = {}): null;
    // get all the activity package in activitiesPath
    if(dirPath){
      let dirs = readDirectoriesSync(dirPath);
      if(dirs&&dirs.length){
        dirs.forEach((dir, index)=>{
          let itemPath = path.join(dirPath, dir);

          let design_package_json=null;
          let value = null;

          // TODO need to improve, provide better way

          if(fileExists(path.join(itemPath, DEFAULT_SCHEMA_ROOT_FOLDER_NAME, 'package.json'))){
            design_package_json = path.join(itemPath, DEFAULT_SCHEMA_ROOT_FOLDER_NAME, 'package.json');
            value = path.join(itemPath, DEFAULT_SCHEMA_ROOT_FOLDER_NAME);
          }else if(fileExists(path.join(itemPath, 'src', DEFAULT_SCHEMA_ROOT_FOLDER_NAME, 'package.json'))){
            design_package_json = path.join(itemPath, 'src', DEFAULT_SCHEMA_ROOT_FOLDER_NAME, 'package.json');
            value = path.join(itemPath, 'src', DEFAULT_SCHEMA_ROOT_FOLDER_NAME);
          }else{
            logger.warn("[Warning] didn't find design time for this activity");
          }

          if(design_package_json){
            let data = fs.readFileSync(design_package_json, {"encoding": "utf8"});
            let designPackageJSONData = JSON.parse(data);
            let type = designPackageJSONData.name;
            if(type){
              packageJSON.dependencies[type] = path.join(value);
              let where = config[type]&&config[type].path? config[type].path: "file://"+itemPath;
              this._where[type] = where;
            }
          }

        });
      }else{
        //console.log("[info]updatePackageJSON. empty");
      }

      let JSONStr = JSON.stringify(packageJSON, null, 2);
      fs.writeFileSync(path.join(this._packageJSONFolderPath, 'package.json').toString(), JSONStr, {"encoding": "utf8"});
    }

    return packageJSON;
  }

  syncDb(originalItems) {
    logger.verbose('updateDB');

    originalItems = originalItems || [];
    // new activities generate from package.json
    let items = {};

    // generate all the activity docs
    originalItems.forEach(item => {
      const info = item.rt;

      const version = info && info.version;
      const id = BaseRegistered.generateID(info.ref, version);

      items[id] = BaseRegistered.constructItem({
        id,
        ref: info.ref,
        name: info.name,
        version,
        description: info.description,
        keywords: item.keywords || [],
        author: info.author,
        schema: info,
      });

    });

    // console.log("!!!!!!!!activityDocs: ", activityDocs);
    return BaseRegistered.saveItems(this.dbService, items)
      .then((result) => {
        logger.verbose('updateDB done.');
        return result;
      });

  }

  updateDB(){
    return new Promise((resolve, reject)=>{
      logger.verbose('updateDB');
      // update activity package.json
      let dependencies;
      if(!process.env[ 'FLOGO_NO_ENGINE_RECREATION' ]) {
        let packageJSON = _.cloneDeep(this.packageJSONTemplate);
        packageJSON = this.updatePackageJSON(this._options.defaultPath, this._options.defaultConfig, packageJSON);
        packageJSON = this.updatePackageJSON(this._options.customPath, this._options.customConfig, packageJSON);
        // console.log(packageJSON);
        dependencies = packageJSON.dependencies;
      } else {
        let existingPackageJSON = JSON.parse(fs.readFileSync(path.join(this._packageJSONFolderPath, 'node_modules', key, 'package.json'), 'utf8'));
        dependencies = existingPackageJSON && existingPackageJSON.dependencies ? existingPackageJSON.dependencies : {};
      }

      // new activities generate from package.json
      let items = {};

      // install all activity packages
      this.install().then(()=>{

        // generate all the activity docs
        _.forOwn(dependencies, (value, key)=>{
          let packageJSON = JSON.parse(fs.readFileSync(path.join(this._packageJSONFolderPath, 'node_modules', key, 'package.json'), 'utf8'));
          let schemaJSON = JSON.parse(fs.readFileSync(path.join(this._packageJSONFolderPath, 'node_modules', key, this._options.schemaJsonName), 'utf8'));
          // console.log("packageJSON: ", packageJSON);
          // console.log("schemaJSON: ", schemaJSON);

          let id = BaseRegistered.generateID(key, packageJSON.version);

          items[ id ] = BaseRegistered.constructItem( {
            id : id,
            ref : this._where[ key ],
            name : key,
            version : packageJSON.version,
            description : packageJSON.description,
            keywords : packageJSON.keywords || [],
            author : packageJSON.author,
            schema : schemaJSON
          } );
        });

        // console.log("!!!!!!!!activityDocs: ", activityDocs);

        BaseRegistered.saveItems( this.dbService, items )
          .then( ( result ) => {
            logger.verbose('updateDB done.');
            return result;
          })
          .then( resolve )
          .catch( reject );

      }).catch((err)=>{
        logger.error('Install error.', err);
        reject(err);
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
      this.npmLoad(()=>{
        // Store current working directory
        var currentCWD = process.cwd();
        logger.verbose('currentCWD: ', currentCWD);
        process.chdir(this._packageJSONFolderPath);
        npm.commands.install(this._packageJSONFolderPath, [], (err, result)=>{
          // Change current working directory back
          process.chdir(currentCWD);
          if(err){
            reject(err);
            logger.error(err);
          }else{
            resolve(result);
          }
        });
      });
    });
  }
}


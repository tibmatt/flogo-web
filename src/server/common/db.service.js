import _ from 'lodash';
import Pouchdb from 'pouchdb';

// TODO need to research how to implement private property and function on ES6
export class DBService{

  constructor(name, options){
    console.log("DBService initial");
    this.options = options
    this._db = this._initDB(name, options);
    this._sync = null;
    this.DELIMITER = ":";
  }

  get db(){
    return this._db;
  }

  _initDB(name, options){
    let db = new Pouchdb(name);
    // PouchDB will be initialled when you call it. So this code is to make sure db is created
    db.info().then((response)=>{
      console.log("[_initDB][response]", response);
    }).catch((error)=>{
      console.log("[_initDB][error]", error);
    });
    return db;
  }
}

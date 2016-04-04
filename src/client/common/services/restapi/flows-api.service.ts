import { Injectable } from 'angular2/core';
import { FlogoDBService } from '../db.service';

@Injectable()
export class RESTAPIFlowsService{
  constructor(private _db: FlogoDBService){
  }

  createFlow(flowObj: Object){
    flowObj._id = this._db.generateFlowID();

    flowObj.$table = this._db.FLOW;

    return new Promise((resolve, reject)=>{
      this._db.create(flowObj).then((response)=>{
          resolve(response);
      }).catch((err)=>{
          reject(err);
      });
    });
  }

  getFlows(){
    return new Promise((resolve, reject)=>{
      // TODO need to change ${this._db.DEFAULT_USER_ID} to correct userID
      let options = {
        include_docs: true,
        startKey: `${this._db.FLOW}${this._db.DELIMITER}${this._db.DEFAULT_USER_ID}${this._db.DELIMITER}`,
        endKey: `${this._db.FLOW}${this._db.DELIMITER}${this._db.DEFAULT_USER_ID}${this._db.DELIMITER}\uffff`
      };
      this._db.allDocs(options).then((response)=>{
        let allFlows = [];
        let rows = response&&response.rows||[];
        rows.forEach((item)=>{
          // if this item's tabel is this._db.FLOW
          if(item&&item.doc&&item.doc.$table === this._db.FLOW){
            allFlows.push(item.doc);
          }
        });
        resolve(allFlows);
      }).catch((err)=>{
        reject(err);
      });
    });
  }

  updateFlow(flowObj: Object){
    return new Promise((resolve, reject)=>{
      this._db.update(flowObj).then((response)=>{
        resolve(response);
      }).catch((err)=>{
        reject(err);
      })
    });
  }

  deleteFlow(){
    let parameters = arguments;
    return new Promise((resolve, reject)=>{
      this._db.remove.apply(this,parameters).then((response)=>{
        resolve(response);
      }).catch((err)=>{
        reject(err);
      })
    });
  }
}

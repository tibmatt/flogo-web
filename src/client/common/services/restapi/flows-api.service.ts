import { Injectable } from 'angular2/core';
import { Http, Headers, RequestOptions, Response } from 'angular2/http';
import { FlogoDBService } from '../db.service';

@Injectable()
export class RESTAPIFlowsService{
  constructor(private _db: FlogoDBService){
  }

  createFlow(flowObj:object){
    if(!flowObj._id){
      flowObj._id = this._db.generateFlowID();
    }

    flowObj.table = 'flows';

    return new Promise((resolve, reject)=>{
      this._db.create(flowObj).then((response)=>{
          resolve(response);
      }).catch((err)=>{
          reject(err);
      });
    });
  }

  getFlows(){

  }
}

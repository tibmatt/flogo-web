import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {RESTAPIFlowsService} from '../../../common/services/restapi/flows-api.service';
import {RESTAPIActivitiesService} from '../../../common/services/restapi/activities-api.service';
import { flogoIDEncode } from '../../../common/utils';

@Component({
  selector: 'flogo-flows',
  moduleId: module.id,
  templateUrl: 'flows.tpl.html',
  styleUrls: ['flows.component.css'],
  directives: [ROUTER_DIRECTIVES],
  providers: [RESTAPIFlowsService, RESTAPIActivitiesService]
})

export class FlogoFlowsComponet{
  constructor(
      private _flow:RESTAPIFlowsService
  ){
    this.getAllFlows();
  }
  public flows:any[] = [];
    // delete a flow
  deleteFlow( id, rev) {
      new Promise((resolve, reject)=> {
          this._flow.deleteFlow(id, rev).then((response)=> {
              console.log('remove flow successful ' + response);
              this.getAllFlows();
              resolve(response);

          }).catch((err)=> {
              console.log('remove flow error ' + err);
              reject(err);
          });
      });
  }
  getAllFlows(){
    return new Promise((resolve, reject)=>{
      this._flow.getFlows().then((response)=>{
        if(typeof response !== 'object'){
          response = JSON.parse(response);
        }
        this.flows = response;
        resolve(response);
      }).catch((err)=>{
        reject(err);
      })
    })
  }
  // create a new flow
  addFlow() {
    new Promise((resolve, reject)=>{
      let request = {
        name: "My Added Flow "+ new Date().toISOString(),
        description: "Created by rest-api.spec",
        paths: {},
        items: {}
      };
      this._flow.createFlow(_.clone(request)).then((response)=>{
          console.log('create flow successful ' + response);
        resolve(response);
      }).catch((err)=>{
        console.log("create flow error ", err);
        reject(err);
      });
    }).then(()=>{
      return this.getAllFlows();
    }).catch((err)=>{
      console.error(err);
    });
  }
  // export flogoIDEncode
  // mainly for Route Link
  flogoIDEncode( id ) {
    return flogoIDEncode( id );
  }
}

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
  renderFlow( response, fail){
   /* let className = 'flogo-flows-container-lists-success';
    let ng2StyleAttrReg = /^_ngcontent\-.*$/g;
    let eleAttrs = document.getElementById('flogo-flows-container-box').attributes;
    let ng2StyleAttr = (function () {
      for (var i = 0; i < eleAttrs.length; i++) {
        if (ng2StyleAttrReg.test(eleAttrs[i].name)) {
          return eleAttrs[i].name;
        }
      }
      return false;
    })();
    let createTime = response.created_at?response.created_at: 'just now';
    if(fail){
      className = 'flogo-flows-container-lists-danger';
    }
    let html = `
    <li ${ng2StyleAttr} data-link="${response._id}" class="flogo-flows-container-list">
      <a ${ng2StyleAttr} class="flogo-flows-container-list-detail" href="/flows/${response._id}">
      <span ${ng2StyleAttr} class="flogo-flows-container-list-detail-trash" (click)="test()"></span>
        <span ${ng2StyleAttr} class="flogo-flows-container-list-detail-name">${response.name}</span>
        <span ${ng2StyleAttr} class="flogo-flows-container-list-detail-creatTime">${createTime}</span>
      </a>
    </li>
    `;
    window.jQuery("#flogo-flows-container-box").addClass(className);
    window.jQuery("#flogo-flows-container-lists").append(html);*/
  }
  deleteFlow( id, rev) {
    console.log(id, rev);
    /*return false;*/
      new Promise((resolve, reject)=> {
          this._flow.deleteFlow(id, rev).then((response)=> {
              console.log('remove flow successful' + response);
              this.getAllFlows();
              resolve(response);

          }).catch((err)=> {
              console.log('remove flow error' + err);
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
        console.log(response + response.length);
        this.flows = response;
        /*response.forEach((ele,index)=>{
         this.renderFlow(ele);
         });*/
        resolve(response);
      }).catch((err)=>{
        this.renderFlow(err, true);
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
        resolve(response);
      }).catch((err)=>{
        console.log("create flow error. ", err);
        this.renderFlow(request, true);
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

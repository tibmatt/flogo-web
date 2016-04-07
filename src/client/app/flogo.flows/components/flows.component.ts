import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {RESTAPIFlowsService} from '../../../common/services/restapi/flows-api.service';
import {RESTAPIActivitiesService} from '../../../common/services/restapi/activities-api.service';

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

  renderFlow( response, fail){
    let className = 'flogo-flows-container-lists-success';
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

    if(fail){
      className = 'flogo-flows-container-lists-danger';
    }
    let html = `
    <li ${ng2StyleAttr} data-link="${response._id}" class="flogo-flows-container-list">
      <div ${ng2StyleAttr} class="flogo-flows-container-list-name">
        ${response.name}
      </div>
      <span ${ng2StyleAttr} class="flogo-flows-container-list-creatTime">${response.created_at}</span>
    </li>
    `;
    window.jQuery("#flogo-flows-container-box").addClass(className);
    window.jQuery("#flogo-flows-container-lists").append(html);

  }
  getAllFlows(){
    new Promise((resolve, reject)=>{
      return new Promise((resolve, reject)=>{
        this._flow.getFlows().then((response)=>{
          if(typeof response !== 'object'){
            response = JSON.parse(response);
          }
          console.log(response + response.length);
          response.forEach((ele,index)=>{
            this.renderFlow(ele);
          });
          resolve(response);
        }).catch((err)=>{
          this.renderFlow(err, true);
          reject(err);
        })
      })
    })
  }
  // create a new flow
  addFlow() {
    new Promise((resolve, reject)=>{
      let request = {
        name: "My Added Flow "+ new Date().toISOString(),
        description: "Created by rest-api.spec"
      };
      this._flow.createFlow(_.clone(request)).then((response)=>{
        console.log("create flow successful. ", response);
        this.renderFlow(request);
        resolve(response);
      }).catch((err)=>{
        console.log("create flow error. ", err);
        this.renderFlow(request, true);
        reject(err);
      });
    }).then(this.getAllFlows);
  }
}

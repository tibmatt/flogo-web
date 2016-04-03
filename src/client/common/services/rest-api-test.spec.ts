import {Component} from 'angular2/core';
import {RESTAPIFlowsService} from './restapi/flows-api.service';

@Component({
  moduleId: module.id,
  template:
            `<div id="test-container" class="container">

            </div>`,
  providers: [RESTAPIFlowsService]
})

export class RESTAPITest{
  constructor(
    private _flow:RESTAPIFlowsService
  ){
    this.testFlow();
  }

  print(title, request, response, fail){
    let className = 'panel-success';
    if(fail){
      className = 'panel-danger';
    }

    if(request){
      if(typeof request == 'object'){
        request = JSON.stringify(request);
      }else{
        request = request.toString();
      }
    }else{
      request = '';
    }

    if(response){
      if(typeof response == 'object'){
        response = JSON.stringify(response);
      }else{
        response = response.toString();
      }
    }else{
      response = '';
    }

    let html = `
    <div class="panel ${className}">
      <div class="panel-heading">${title}</div>
      <div class="panel-body">
        <h3>
          Request
        </h3>
        <div>
        ${request}
        </div>
        <h3>
          Response
        </h3>
        <div>
        ${response}
        </div>

      </div>
    </div>
    `;
    window.jQuery("#test-container").append(html);
  }

  testFlow(){

    // step 1: create flow
    let request = {
      name: "My First Flow "+ new Date().toISOString(),
      description: "Created by rest-api.spec"
    };
    // create a flow
    this._flow.createFlow(_.clone(request)).then((response)=>{
      console.log("create flow successful. ", response);
      this.print('create flow successful',request, response);
    }).catch((err)=>{
      console.log("create flow error. ", err);
      this.print('create flow error',request, err, true);
    });

    // step 2: get flow


  }
}

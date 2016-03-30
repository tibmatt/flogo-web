import { Injectable } from 'angular2/core';
import { FlogoFlowDiagramProcess, IFlogoFlowDiagram, IFlogoFlowDiagramTaskDictionary } from '../models';

@Injectable()
export class RESTAPIService {

  flows : any;
  activities : any;
  triggers : any;

  mockFlow : any;

  // TODO
  //    need to replace this mock with real implementation
  constructor() {

    // TODO
    //    this is only mock implementation
    this.mockFlow = {
      "1" : {
        "created" : 1459288333311,
        "paths" : {},
        "name" : "Payroll Distribution",
        "description" : "This is a demo flow",
        "id" : "1",
        "updated" : 1459288333311,
        "items" : {}
      }
    };

    // TODO
    //    To use fetch API? fetch('http://localhost:2560/flows', {mode:'no-cors'})
    this.flows = {
      get : () => {
        return Promise.resolve(
          [
            {
              "id" : "1",
              "name" : "Payroll Distribution",
              "description" : "Chase payroll",
              "created" : 1459288333311,
              "updated" : 1459288333311
            },
            {
              "name" : "Hello World",
              "description" : "My first flow",
              "created" : 1459288333311,
              "updated" : 1459288333311
            }
          ]
        );
      },
      getFlowByID : ( id : string ) => {
        return Promise.resolve( this.mockFlow[ id ] );
      },
      updateFlowByID : ( id : string, flow : any ) => {
        this.mockFlow[ id ] = flow
        return Promise.resolve( id );
      },
      getFlowConfigByID : ( id : string ) => {
        return Promise.resolve(
          FlogoFlowDiagramProcess.toProcess(
            <IFlogoFlowDiagram>this.mockFlow[ id ].paths,
            <IFlogoFlowDiagramTaskDictionary>this.mockFlow[ id ].items
          )
        );
      }
    }
  }

}

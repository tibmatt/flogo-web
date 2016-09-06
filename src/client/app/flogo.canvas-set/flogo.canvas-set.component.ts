import { Component } from '@angular/core';
import { FlogoCanvasComponent } from '../flogo.flows.detail/components/canvas.component';
import { ROUTER_DIRECTIVES,  RouteConfig, RouteParams,  RouterOutlet,  Router, CanActivate } from '@angular/router-deprecated';
import {FlogoFlowsDetail} from './../flogo.flows.detail/components/flow-detail.component';
import {FlogoFlowsDetailTriggers} from '../flogo.flows.detail.triggers/components/triggers.component';
import {FlogoFlowsDetailTriggersDetail} from '../flogo.flows.detail.triggers.detail/components/detail.component';
import {FlogoFlowsDetailTasks} from '../flogo.flows.detail.tasks/components/tasks.component';
import {FlogoFlowsDetailTasksDetail} from '../flogo.flows.detail.tasks.detail/components/detail.component';
import { RESTAPIService } from '../../common/services/rest-api.service';
import { FlogoFlowsDetailDiagramComponent } from '../flogo.flows.detail.diagram/components';
import { RESTAPIFlowsService } from '../../common/services/restapi/flows-api.service';
import { isConfigurationLoaded } from '../../common/services/configurationLoaded.service';

import {
    IFlogoFlowDiagramTaskDictionary,
    IFlogoFlowDiagram,
} from '../../common/models';


import { Contenteditable, JsonDownloader } from '../../common/directives';
import { flogoFlowToJSON } from '../flogo.flows.detail.diagram/models/flow.model';

import {
    flogoIDDecode, flogoIDEncode,notification
} from '../../common/utils';


@Component({
   selector: 'flogo-canvas-set',
   moduleId: module.id,
   templateUrl: 'flogo.canvas-set.tpl.html',
   directives: [ROUTER_DIRECTIVES, FlogoCanvasComponent, RouterOutlet, Contenteditable, JsonDownloader, FlogoFlowsDetailDiagramComponent],
    styleUrls: ['flogo.canvas-set.component.css']
})
@CanActivate((next) => {
    return isConfigurationLoaded();
})
@RouteConfig([
    {path:'/',    name: 'FlogoFlowsDetailDefault',   component: FlogoFlowsDetail, useAsDefault: true},
    {path:'/trigger/add',    name: 'FlogoFlowsDetailTriggerAdd',   component: FlogoFlowsDetailTriggers},
    {path:'/trigger/:id',    name: 'FlogoFlowsDetailTriggerDetail',   component: FlogoFlowsDetailTriggersDetail},
    {path:'/task/add',    name: 'FlogoFlowsDetailTaskAdd',   component: FlogoFlowsDetailTasks},
    {path:'/task/:id',    name: 'FlogoFlowsDetailTaskDetail',   component: FlogoFlowsDetailTasksDetail }
])
export class FlogoCanvasSetComponent {
   private flowId: string;
    private flowIdError: string;

   private diagram: IFlogoFlowDiagram;
   private tasks: IFlogoFlowDiagramTaskDictionary;
   private _flow: any;


   private diagramError: IFlogoFlowDiagram;
   private tasksError: IFlogoFlowDiagramTaskDictionary;
   private _flowError: any;

   private _mockLoading: boolean;
   private _isCurrentProcessDirty:boolean = true;
  private _mockProcess: any;
  private exportLink:string;
  private downloadLink: string;

   constructor(
       private _routerParams: RouteParams,
       private _restAPIFlowsService: RESTAPIFlowsService
   ) {
       this.flowId = this._routerParams.params['id'];

       this.downloadLink = `/v1/api/flows/${this.flowId}/build`;

       this._mockLoading = true;


       try {
           this.flowId = flogoIDDecode( this.flowId );
           this.flowIdError = flogoIDDecode('Zmxvd3M6ZmxvZ293ZWItYWRtaW46MjAxNi0wOS0wNlQxNzoxOTowNS40Mjha');
       } catch ( e ) {
           console.warn( e );
       }


       this.exportLink = `/v1/api/flows/${this.flowId}/json`;

       this.getFlow(this.flowId)
            .then((res:any)=> {
                debugger;
                this._flow = res._flow;
                this.diagram = res.diagram;
                this.tasks = res.tasks;
                //this._mockLoading = false;

                this.getFlow(this.flowIdError)
                    .then((res:any)=>{
                        debugger;
                        this._flowError = res._flow;
                        this.diagramError = res.diagram;
                        this.tasksError = res.tasks;
                        this._mockLoading = false;
                    });

       });



       /*
      this._restAPIFlowsService.getFlow(this.flowId)
          .then(
              ( rsp : any )=> {
                 if ( !_.isEmpty( rsp ) ) {
                    // initialisation
                    console.group( 'Initialise canvas component' );

                    this._flow = rsp;

                    this.tasks = this._flow.items;
                    if ( _.isEmpty( this._flow.paths ) ) {
                       this.diagram = this._flow.paths = <IFlogoFlowDiagram>{
                          root : {},
                          nodes : {}
                       };
                    } else {
                       this.diagram = this._flow.paths;
                    }
                    return this._flow;

                 } else {
                    return this._flow;
                 }
              }
          )
          .then(
              ()=> {
                 this._mockLoading = false;
              }
          )
          .catch(
              ( err : any )=> {
                 if ( err.status === 404 ) {
                    //### this._router.navigate(['FlogoFlows']);
                 } else {
                    return err;
                 }
              }
          );
          */



   }

    private getFlow(id:string) {
        let diagram: IFlogoFlowDiagram;
        let tasks: IFlogoFlowDiagramTaskDictionary;
        let _flow: any;

        return new Promise((resolve, reject)=> {

            this._restAPIFlowsService.getFlow(id)
                .then(
                    ( rsp : any )=> {


                        if ( !_.isEmpty( rsp ) ) {
                            // initialisation
                            console.group( 'Initialise canvas component' );

                            _flow = rsp;

                            tasks = _flow.items;
                            if ( _.isEmpty( _flow.paths ) ) {
                                diagram = _flow.paths = <IFlogoFlowDiagram>{
                                    root : {},
                                    nodes : {}
                                };
                            } else {
                                diagram = _flow.paths;
                            }
                            //return this._flow;

                        } else {
                            //return this._flow;
                        }

                        resolve({diagram, tasks, _flow});
                    }
                )
                /*.then(
                    ()=> {
                        this._mockLoading = false;
                    }
                )*/
                .catch(
                    ( err : any )=> {

                        reject(null);

                        /*
                        if ( err.status === 404 ) {
                            //### this._router.navigate(['FlogoFlows']);
                        } else {
                            return err;
                        }
                        */
                    }
                );

        });
    }

    private changeFlowDetail($event, property) {

        return new Promise((resolve, reject)=>{
            this._updateFlow(this._flow).then((response:any)=>{
                notification(`Update flow's ${property} successfully!`,'success', 3000);
                resolve(response);
            }).catch((err)=>{
                notification(`Update flow's ${property} error: ${err}`, 'error');
                reject(err);
            });
        })

    }

    private _updateMockProcess() {
        if ( !_.isEmpty( this._flow ) ) {
            this._restAPIFlowsService.getFlows()
                .then(
                    ( rsp : any ) => {
                        this._mockProcess = _.find( rsp, { _id : this._flow._id } );
                        this._mockProcess = flogoFlowToJSON( this._mockProcess );
                    }
                );
        }
    }

    exportFlow () {
        return this._exportFlow.bind(this);
    }

    private _exportFlow() {
        return new Promise((resolve, reject) => {
            resolve(flogoFlowToJSON( this._flow ));
        });
    }

    private _updateFlow( flow : any ) {
        this._isCurrentProcessDirty = true;

        // processing this._flow to pure JSON object
        flow = _.cloneDeep( flow );
        _.each(
            _.keys( flow.paths ), ( key : string ) => {
                if ( key !== 'root' && key !== 'nodes' ) {
                    delete flow.paths[ key ];
                }
            }
        );
        flow = JSON.parse( JSON.stringify( flow ) );

        return this._restAPIFlowsService.updateFlow( flow )
            .then(
                ( rsp : any ) => {
                    console.log( rsp );
                }
            )
            .then(
                () => {
                    // TODO
                    //  remove this mock
                    return this._updateMockProcess();
                }
            );
    }

}




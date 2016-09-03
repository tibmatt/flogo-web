import { Component } from '@angular/core';
import { FlogoCanvasComponent } from '../flogo.flows.detail/components/canvas.component';
import { ROUTER_DIRECTIVES,  RouteParams,  RouterOutlet,  Router, CanActivate } from '@angular/router-deprecated';
import { RESTAPIService } from '../../common/services/rest-api.service';
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
   directives: [ROUTER_DIRECTIVES, Contenteditable, JsonDownloader],
    styleUrls: ['flogo.canvas-set.component.css']
})
@CanActivate((next) => {
    return isConfigurationLoaded();
})
export class FlogoCanvasSetComponent {
   private id: string;
   private diagram: IFlogoFlowDiagram;
   private tasks: IFlogoFlowDiagramTaskDictionary;
   private _flow: any;
   private _mockLoading: boolean;
   private _isCurrentProcessDirty:boolean = true;
    private _mockProcess: any;

   constructor(
       private _routerParams: RouteParams,
       private _restAPIFlowsService: RESTAPIFlowsService
   ) {
      this.id = this._routerParams.params['id'];
       this._mockLoading = true;


       try {
           this.id = flogoIDDecode( this.id );
       } catch ( e ) {
           console.warn( e );
       }

      this._restAPIFlowsService.getFlow(this.id)
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

                    //### this.clearTaskRunStatus();
                    //### this.initSubscribe();
                    //### console.groupEnd();
                    //### return this._updateFlow( this._flow );
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




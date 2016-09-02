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

@Component({
   selector: 'flogo-canvas-set',
   moduleId: module.id,
   templateUrl: 'flogo.canvas-set.tpl.html',
   directives: [ROUTER_DIRECTIVES]
})
@CanActivate((next) => {
    return isConfigurationLoaded();
})
export class FlogoCanvasSetComponent {
   private id: string;
   private diagram: IFlogoFlowDiagram;
   private tasks: IFlogoFlowDiagramTaskDictionary;
   private _flow: any;

   constructor(
       private _routerParams: RouteParams,
       private _restAPIFlowsService: RESTAPIFlowsService
   ) {
       debugger;
      this.id = this._routerParams.params['id'];

      this._restAPIFlowsService.getFlow(this.id)
          .then(
              ( rsp : any )=> {
                  debugger;

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

                     debugger;
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
                 //### this._mockLoading = false;
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
}




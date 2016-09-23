import {Component} from '@angular/core';
import {FlogoCanvasComponent} from '../flogo.flows.detail/components/canvas.component';
import {
  ROUTER_DIRECTIVES,
  RouteConfig,
  RouteParams,
  RouterOutlet,
  Router,
  CanActivate
} from '@angular/router-deprecated';
import {FlogoFlowsDetail} from './../flogo.flows.detail/components/flow-detail.component';
import {FlogoFlowsDetailTriggers} from '../flogo.flows.detail.triggers/components/triggers.component';
import {FlogoFlowsDetailTriggersDetail} from '../flogo.flows.detail.triggers.detail/components/detail.component';
import {FlogoFlowsDetailTasks} from '../flogo.flows.detail.tasks/components/tasks.component';
import {FlogoFlowsDetailTasksDetail} from '../flogo.flows.detail.tasks.detail/components/detail.component';
import {RESTAPIService} from '../../common/services/rest-api.service';
import {FlogoFlowsDetailDiagramComponent} from '../flogo.flows.detail.diagram/components';
import {RESTAPIFlowsService} from '../../common/services/restapi/flows-api.service';
import {isConfigurationLoaded} from '../../common/services/configurationLoaded.service';

import {
  IFlogoFlowDiagramTaskDictionary,
  IFlogoFlowDiagram,
} from '../../common/models';


import {Contenteditable, JsonDownloader} from '../../common/directives';
import {flogoFlowToJSON} from '../flogo.flows.detail.diagram/models/flow.model';

import {
  flogoIDDecode, flogoIDEncode, notification
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
  {path: '/', name: 'FlogoFlowsDetailDefault', component: FlogoFlowsDetail, useAsDefault: true},
  {path: '/trigger/add', name: 'FlogoFlowsDetailTriggerAdd', component: FlogoFlowsDetailTriggers},
  {path: '/trigger/:id', name: 'FlogoFlowsDetailTriggerDetail', component: FlogoFlowsDetailTriggersDetail},
  {path: '/task/add', name: 'FlogoFlowsDetailTaskAdd', component: FlogoFlowsDetailTasks},
  {path: '/task/:id', name: 'FlogoFlowsDetailTaskDetail', component: FlogoFlowsDetailTasksDetail}
])
export class FlogoCanvasSetComponent {
  public flow: any;
  public flowId: string;
  public mainSubflow: {diagram: IFlogoFlowDiagram, tasks: IFlogoFlowDiagramTaskDictionary};
  public errorSubflow: {diagram: IFlogoFlowDiagram, tasks: IFlogoFlowDiagramTaskDictionary};

  public loading: boolean;
  public isCurrentProcessDirty: boolean = true;
  public mockProcess: any;
  public exportLink: string;
  public downloadLink: string;

  constructor(private _routerParams: RouteParams,
              private _restAPIFlowsService: RESTAPIFlowsService) {
    /*
    this.flowId = this._routerParams.params['id'];

    this.downloadLink = `/v1/api/flows/${this.flowId}/build`;

    this.loading = true;

    try {
      this.flowId = flogoIDDecode(this.flowId);
    } catch (e) {
      console.warn(e);
    }

    this.exportLink = `/v1/api/flows/${this.flowId}/json`;

    this.getFlow(this.flowId)
      .then((res: any)=> {
        this.flow = res.flow;
        this.mainSubflow = res.root;
        this.errorSubflow = res.errorHandler;
        this.loading = false;
      });
      */

  }

  private getFlow(id: string) {
    let diagram: IFlogoFlowDiagram;
    let errorDiagram: IFlogoFlowDiagram;
    let tasks: IFlogoFlowDiagramTaskDictionary;
    let errorTasks: IFlogoFlowDiagramTaskDictionary;
    let flow: any;


    return new Promise((resolve, reject)=> {

      this._restAPIFlowsService.getFlow(id)
        .then(
          (rsp: any)=> {


            if (!_.isEmpty(rsp)) {
              // initialisation
              console.group('Initialise canvas component');

              flow = rsp;

              tasks = flow.items;
              if (_.isEmpty(flow.paths)) {
                diagram = flow.paths = <IFlogoFlowDiagram>{
                  root: {},
                  nodes: {}
                };
              } else {
                diagram = flow.paths;
              }

              if (_.isEmpty(flow.errorHandler)) {
                flow.errorHandler = {paths: {}, items: {}};
              }

              errorTasks = flow.errorHandler.items;
              if (_.isEmpty(flow.errorHandler.paths)) {
                errorDiagram = flow.errorHandler.paths = <IFlogoFlowDiagram>{
                  root: {},
                  nodes: {}
                }
              } else {
                errorDiagram = flow.errorHandler.paths;
              }


            }

            resolve({
              flow,
              root: {
                diagram, tasks
              },
              errorHandler: {
                diagram: errorDiagram, tasks: errorTasks
              }
            });
          }
        )
        .catch(
          (err: any)=> {

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

    return new Promise((resolve, reject)=> {
      this._updateFlow(this.flow).then((response: any)=> {
        notification(`Update flow's ${property} successfully!`, 'success', 3000);
        resolve(response);
      }).catch((err)=> {
        notification(`Update flow's ${property} error: ${err}`, 'error');
        reject(err);
      });
    })

  }

  private _updateMockProcess() {
    if (!_.isEmpty(this.flow)) {
      this._restAPIFlowsService.getFlows()
        .then(
          (rsp: any) => {
            this.mockProcess = _.find(rsp, {_id: this.flow._id});
            this.mockProcess = flogoFlowToJSON(this.mockProcess);
          }
        );
    }
  }

  exportFlow() {
    return this._exportFlow.bind(this);
  }

  private _exportFlow() {
    return new Promise((resolve, reject) => {
      resolve(flogoFlowToJSON(this.flow));
    });
  }

  private _updateFlow(flow: any) {
    this.isCurrentProcessDirty = true;

    // processing this.flow to pure JSON object
    flow = _.cloneDeep(flow);
    _.each(
      _.keys(flow.paths), (key: string) => {
        if (key !== 'root' && key !== 'nodes') {
          delete flow.paths[key];
        }
      }
    );
    flow = JSON.parse(JSON.stringify(flow));

    return this._restAPIFlowsService.updateFlow(flow)
      .then(
        (rsp: any) => {
          console.log(rsp);
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




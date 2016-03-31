import { Component, EventEmitter, DynamicComponentLoader } from 'angular2/core';
import { RouteConfig, RouterOutlet, RouteParams, Router } from 'angular2/router';
import {PostService} from '../../../common/services/post.service';
import { FlogoCanvasFlowComponent } from '../../flogo.flows.detail.graphic/components/flow.component';
import { FlogoFlowsDetailDiagramComponent } from '../../flogo.flows.detail.diagram/components';
import {FlogoFlowsDetail} from './flow-detail.component';
import {FlogoFlowsDetailTriggers} from '../../flogo.flows.detail.triggers/components/triggers.component';
import {FlogoFlowsDetailTriggersDetail} from '../../flogo.flows.detail.triggers.detail/components/detail.component';
import {FlogoFlowsDetailTasks} from '../../flogo.flows.detail.tasks/components/tasks.component';
import {FlogoFlowsDetailTasksDetail} from '../../flogo.flows.detail.tasks.detail/components/detail.component';
import {FlogoTaskComponent} from '../../flogo.task/components/task.component';

import {
  FlogoFlowDiagramTask,
  IFlogoFlowDiagramTask,
  IFlogoFlowDiagramTaskDictionary,
  IFlogoFlowDiagram
} from '../../../common/models';

import { SUB_EVENTS as FLOGO_DIAGRAM_PUB_EVENTS, PUB_EVENTS as FLOGO_DIAGRAM_SUB_EVENTS } from '../../flogo.flows.detail.diagram/messages';
import { PUB_EVENTS as FLOGO_GRAPHIC_SUB_EVENTS} from '../../flogo.flows.detail.graphic/messages';

import {
  DIAGRAM,
  TASKS,
  TEST_DIAGRAM,
  TEST_TASKS,
  MOCK_TASKS_ARR
} from '../../../common/mocks';

import { FLOGO_TASK_TYPE } from '../../../common/constants';
import { RESTAPIService } from '../../../common/services/rest-api.service';
import {ElementRef} from "angular2/core";


@Component( {
  selector: 'flogo-canvas',
  moduleId: module.id,
  directives: [ RouterOutlet, FlogoCanvasFlowComponent, FlogoFlowsDetailDiagramComponent ],
  templateUrl: 'canvas.tpl.html',
  styleUrls: [ 'canvas.component.css' ]
} )

@RouteConfig([
  {path:'/',    name: 'FlogoFlowsDetailDefault',   component: FlogoFlowsDetail, useAsDefault: true},
  {path:'/trigger/add',    name: 'FlogoFlowsDetailTriggerAdd',   component: FlogoFlowsDetailTriggers},
  {path:'/trigger/:id',    name: 'FlogoFlowsDetailTriggerDetail',   component: FlogoFlowsDetailTriggersDetail},
  {path:'/task/add',    name: 'FlogoFlowsDetailTaskAdd',   component: FlogoFlowsDetailTasks},
  {path:'/task/:id',    name: 'FlogoFlowsDetailTaskDetail',   component: FlogoFlowsDetailTasksDetail}
])

export class FlogoCanvasComponent {
  _loadedComponent: any;
  _subscriptions : any[];

  private disposeLoadedComponent() {
    if(this._loadedComponent) {
      this._loadedComponent.dispose();
    }
  }


  private initSubscribe(){
    this._subscriptions = [
      _.assign( {}, FLOGO_DIAGRAM_SUB_EVENTS.addTask,       { callback : this._addTask.bind( this ) } ),
      _.assign( {}, FLOGO_DIAGRAM_SUB_EVENTS.addTrigger,    { callback : this._addTrigger.bind( this ) } ),
      _.assign( {}, FLOGO_DIAGRAM_SUB_EVENTS.selectTask,    { callback : this._selectTask.bind( this ) } ),
      _.assign( {}, FLOGO_DIAGRAM_SUB_EVENTS.selectTrigger, { callback : this._selectTrigger.bind( this ) } ),
      _.assign( {}, FLOGO_GRAPHIC_SUB_EVENTS.addTask,       { callback : this._addTaskGraphic.bind( this ) } ),
      _.assign( {}, FLOGO_GRAPHIC_SUB_EVENTS.addTrigger,    { callback : this._addTriggerGraphic.bind( this ) } ),
      _.assign( {}, FLOGO_GRAPHIC_SUB_EVENTS.selectTask,    { callback : this._selectTaskGraphic.bind( this ) } ),
      _.assign( {}, FLOGO_GRAPHIC_SUB_EVENTS.selectTrigger, { callback : this._selectTriggerGraphic.bind( this ) } )
    ];

    // TODO
    //   1. merge these mocks with real implementation
    //   2. unsubscribe on destroy
    _.each( this._subscriptions, sub => {
        this._postService.subscribe( sub );
      }
    );
  }

  ngOnDestroy() {
    _.each( this._subscriptions, sub => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  private tasks: IFlogoFlowDiagramTaskDictionary;
  private diagram: IFlogoFlowDiagram;
  private _flow: any;
  private _mockProcess: any;
  private MOCK_TASKS_ARR_ORIGINAL: any[];

  constructor(
    private _postService: PostService,
    private _restAPIService: RESTAPIService,
    private _routerParams: RouteParams,
    private _router: Router,
    private _dcl: DynamicComponentLoader,
    private _elementRef: ElementRef
  ) {
    // TODO For mock purposes I need to have a reference to the original, because the elements are shifted
    this.MOCK_TASKS_ARR_ORIGINAL = MOCK_TASKS_ARR.slice(0);

    this._restAPIService.flows.getFlowByID( this._routerParams.params[ 'id' ] )
      .then(
        ( flow : any )=> {
          this._flow = flow;
          this.tasks = this._flow.items;
          if ( _.isEmpty( this._flow.paths ) ) {
            this.diagram = this._flow.paths = <IFlogoFlowDiagram>{
              root : {},
              nodes : {}
            };
          } else {
            this.diagram = this._flow.paths;
          }
        }
      )
      .then(
        ()=> {
          // TODO
          //    remove this mock later
          this._updateFlow( this._flow );
        }
      );
    this.initSubscribe();
  }

  // TODO
  //  Remove this mock later
  private _updateMockProcess() {
    if ( !_.isEmpty( this._flow ) ) {

      this._restAPIService.flows.getFlowConfigByID( this._flow.id )
        .then(
          ( process : any )=> {
            this._mockProcess = process;
          }
        );
    }
  }

  // TODO
  //  Remove this mock later
  private _updateFlow( flow : any ) {
    this._restAPIService.flows.updateFlowByID( this._flow.id, flow )
      .then(
        () => {
          // TODO
          //  remove this mock
          this._updateMockProcess();
        }
      );
  }

  private _addTrigger( data: any, envelope: any ) {
    console.group( 'Add Trigger' );

    console.log( data );
    console.log( envelope );

    // TODO
    //   replace this mock
    let newRootTask = new FlogoFlowDiagramTask( < IFlogoFlowDiagramTask > _.assign( MOCK_TASKS_ARR.shift( ) || {}, {
      type: FLOGO_TASK_TYPE.TASK_ROOT
    } ) );

    newRootTask.name = 'HTTP Trigger';

    this.tasks[ newRootTask.id ] = newRootTask;

    this._postService.publish( _.assign( {}, FLOGO_DIAGRAM_PUB_EVENTS.addTrigger, {
      data: {
        node: data.node,
        task: newRootTask
      },
      done : ( diagram : IFlogoFlowDiagram ) => {
        _.assign( this.diagram, diagram );
        this._updateFlow( this._flow );
      }
    } ) );

    console.groupEnd( );
  }

  private _addTask( data: any, envelope: any ) {
    console.group( 'Add Task' );

    console.log( data );
    console.log( envelope );

    // TODO
    //   replace this mock
    let newTask = new FlogoFlowDiagramTask( < IFlogoFlowDiagramTask > ( MOCK_TASKS_ARR.shift( ) || {} ) );

    this.tasks[ newTask.id ] = newTask;

    this._postService.publish( _.assign( {}, FLOGO_DIAGRAM_PUB_EVENTS.addTask, {
      data : {
        node : data.node,
        task : newTask
      },
      done : ( diagram : IFlogoFlowDiagram ) => {
        _.assign( this.diagram, diagram );
        this._updateFlow( this._flow );
      }
    } ) );

    console.groupEnd( );
  }

  private _selectTrigger( data: any, envelope: any ) {
    console.group( 'Select Trigger' );

    console.log( data );
    console.log( envelope );

    this._postService.publish( _.assign( {}, FLOGO_DIAGRAM_PUB_EVENTS.selectTrigger, {
      data : {},
      done : ( diagram : IFlogoFlowDiagram ) => {
        _.assign( this.diagram, diagram );
        this._updateFlow( this._flow );
      }
    } ) );

    console.groupEnd( );
  }

  private _selectTask( data: any, envelope: any ) {
    console.group( 'Select Task' );
    console.log( data );
    console.log( envelope );

    this._loadComponentInTaskUI(data.node.taskID);

    this._postService.publish( _.assign( {}, FLOGO_DIAGRAM_PUB_EVENTS.selectTask, {
      data : {},
      done : ( diagram : IFlogoFlowDiagram ) => {
        _.assign( this.diagram, diagram );
        this._updateFlow( this._flow );
      }
    } ) );

    console.groupEnd( );
  }

  private _addTaskGraphic() {
    this.disposeLoadedComponent();
    console.group("FlogoNavbarComponent -> add task");
    console.log("receive: ", arguments);
    this._router.navigate(['FlogoFlowsDetailTaskAdd']);
    console.groupEnd();
  }


  private _selectTaskGraphic() {
    this.disposeLoadedComponent();
    console.group("FlogoNavbarComponenkt -> select task");
    console.log("receive: ", arguments);
    this._router.navigate(['FlogoFlowsDetailTaskDetail', {id:1}]);
    console.groupEnd();
  }


  private _addTriggerGraphic() {
    this.disposeLoadedComponent();
    console.group("FlogoNavbarComponent -> add trigger");
    console.log("receive: ", arguments);
    this._router.navigate(['FlogoFlowsDetailTriggerAdd']);
    console.groupEnd();
  }


  private _selectTriggerGraphic() {
    this.disposeLoadedComponent();
    console.group("FlogoNavbarComponent -> select trigger");
    console.log("receive: ", arguments);
    this._router.navigate(['FlogoFlowsDetailTriggerDetail', {id:1}]);
    console.groupEnd();
  }

  private _loadComponentInTaskUI(taskId:string) {
    var task = this.MOCK_TASKS_ARR_ORIGINAL.find((task) => {
      return task.id === taskId;
    });

    if(task) {
      this.disposeLoadedComponent();

      this._dcl.loadIntoLocation(FlogoTaskComponent, this._elementRef, "taskUI")
        .then((ref:any) => {
          this._loadedComponent = ref;
          ref.instance.setData(task);
        });
    }

  }





}

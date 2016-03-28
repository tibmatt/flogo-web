import { Component, EventEmitter } from 'angular2/core';
import { RouteConfig, RouterOutlet, RouteParams, Router } from 'angular2/router';
import {PostService} from '../../../common/services/post.service';
import { FlogoCanvasFlowComponent } from '../../flogo.flows.detail.graphic/components/flow.component';
import { FlogoFlowsDetailDiagramComponent } from '../../flogo.flows.detail.diagram/components';
import {FlogoFlowsDetail} from './flow-detail.component';
import {FlogoFlowsDetailTriggers} from '../../flogo.flows.detail.triggers/components/triggers.component';
import {FlogoFlowsDetailTriggersDetail} from '../../flogo.flows.detail.triggers.detail/components/detail.component';
import {FlogoFlowsDetailTasks} from '../../flogo.flows.detail.tasks/components/tasks.component';
import {FlogoFlowsDetailTasksDetail} from '../../flogo.flows.detail.tasks.detail/components/detail.component';

import {
  FlogoDiagram,
  FlogoTask,
  IFlogoTask,
  IFlogoTaskDictionary,
  IFlogoDiagram,
  FLOGO_TASK_TYPE,
  FLOGO_ATTRIBUTE_TYPE,
  FLOGO_ACTIVITY_TYPE,
  FLOGO_NODE_TYPE
} from '../../models';

import {
  DIAGRAM,
  TASKS,
  TEST_DIAGRAM,
  TEST_TASKS,
  MOCK_TASKS_ARR
} from '../../mocks';

const PUB_EVENTS = {
  addTaskDone: {
    channel: 'mock-flogo-flows-detail-diagram',
    topic: 'add-task-done'
  },
  selectTaskDone: {
    channel: 'mock-flogo-flows-detail-diagram',
    topic: 'select-task-done'
  },
  addTriggerDone: {
    channel: 'mock-flogo-flows-detail-diagram',
    topic: 'add-trigger-done'
  },
  selectTriggerDone: {
    channel: 'mock-flogo-flows-detail-diagram',
    topic: 'select-trigger-done'
  }
};

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

  private initSubscribe(){
    this._postService.subscribe({
      channel: "flogo-flows-detail-graphic",
      topic: "add-trigger",
      callback: function(){
        console.group("FlogoNavbarComponent -> add trigger");
        console.log("receive: ", arguments);
        this._router.navigate(['FlogoFlowsDetailTriggerAdd']);
        console.groupEnd();
      }.bind(this)
    });

    this._postService.subscribe({
      channel: "flogo-flows-detail-graphic",
      topic: "select-trigger",
      callback: function(){
        console.group("FlogoNavbarComponent -> select trigger");
        console.log("receive: ", arguments);
        this._router.navigate(['FlogoFlowsDetailTriggerDetail', {id:1}]);
        console.groupEnd();
      }.bind(this)
    });

    this._postService.subscribe({
      channel: "flogo-flows-detail-graphic",
      topic: "add-task",
      callback: function(){
        console.group("FlogoNavbarComponent -> add task");
        console.log("receive: ", arguments);
        this._router.navigate(['FlogoFlowsDetailTaskAdd']);
        console.groupEnd();
      }.bind(this)
    });

    this._postService.subscribe({
      channel: "flogo-flows-detail-graphic",
      topic: "select-task",
      callback: function(){
        console.group("FlogoNavbarComponent -> select task");
        console.log("receive: ", arguments);
        this._router.navigate(['FlogoFlowsDetailTaskDetail', {id:1}]);
        console.groupEnd();
      }.bind(this)
    });

    // TODO
    //   1. merge these mocks with real implementation
    //   2. unsubscribe on destroy
    this._postService.subscribe( {
      channel: 'mock-flogo-flows-detail-diagram',
      topic: 'add-trigger',
      callback: this._addTrigger.bind(this)
    } );
    this._postService.subscribe( {
      channel: 'mock-flogo-flows-detail-diagram',
      topic: 'select-trigger',
      callback: this._selectTrigger.bind(this)
    } );
    this._postService.subscribe( {
      channel: 'mock-flogo-flows-detail-diagram',
      topic: 'add-task',
      callback: this._addTask.bind(this)
    } );
    this._postService.subscribe( {
      channel: 'mock-flogo-flows-detail-diagram',
      topic: 'select-task',
      callback: this._selectTask.bind(this)
    } );
  }

  public tasks: IFlogoTaskDictionary;
  public diagram: IFlogoDiagram;

  constructor(
    private _postService: PostService,
    private _routerParams: RouteParams,
    private _router: Router
  ) {
    this.tasks = TASKS;
    this.diagram = DIAGRAM;
    this.initSubscribe();
  }

  private _addTrigger( data: any, envelope: any ) {
    console.group( 'Add Trigger' );

    console.log( data );
    console.log( envelope );

    // TODO
    //   replace this mock
    let newRootTask = new FlogoTask( < IFlogoTask > _.assign( MOCK_TASKS_ARR.shift( ) || {}, {
      type: FLOGO_TASK_TYPE.TASK_ROOT
    } ) );

    newRootTask.name = 'HTTP Trigger';

    this.tasks[ newRootTask.id ] = newRootTask;

    this._postService.publish( _.assign( {}, PUB_EVENTS.addTriggerDone, {
      data: {
        node: data.node,
        task: newRootTask
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
    let newTask = new FlogoTask( < IFlogoTask > ( MOCK_TASKS_ARR.shift( ) || {} ) );

    this.tasks[ newTask.id ] = newTask;

    this._postService.publish( _.assign( {}, PUB_EVENTS.addTaskDone, {
      data: {
        node: data.node,
        task: newTask
      }
    } ) );

    console.groupEnd( );
  }

  private _selectTrigger( data: any, envelope: any ) {
    console.group( 'Select Trigger' );

    console.log( data );
    console.log( envelope );

    this._postService.publish( _.assign( {}, PUB_EVENTS.selectTriggerDone, {
      data: {}
    } ) );

    console.groupEnd( );
  }

  private _selectTask( data: any, envelope: any ) {
    console.group( 'Select Task' );

    console.log( data );
    console.log( envelope );

    this._postService.publish( _.assign( {}, PUB_EVENTS.selectTaskDone, {
      data: {}
    } ) );

    console.groupEnd( );
  }
}

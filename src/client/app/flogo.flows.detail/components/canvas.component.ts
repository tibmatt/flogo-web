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
  TEST_TASKS
} from '../../mocks';

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
      channel: "flogo.flows.detail.graphic",
      topic: "add-trigger",
      callback: function(){
        console.group("FlogoNavbarComponent -> add trigger");
        console.log("receive: ", arguments);
        this._router.navigate(['FlogoFlowsDetailTriggerAdd']);
        console.groupEnd();
      }.bind(this)
    });

    this._postService.subscribe({
      channel: "flogo.flows.detail.graphic",
      topic: "select-trigger",
      callback: function(){
        console.group("FlogoNavbarComponent -> select trigger");
        console.log("receive: ", arguments);
        this._router.navigate(['FlogoFlowsDetailTriggerDetail', {id:1}]);
        console.groupEnd();
      }.bind(this)
    });

    this._postService.subscribe({
      channel: "flogo.flows.detail.graphic",
      topic: "add-task",
      callback: function(){
        console.group("FlogoNavbarComponent -> add task");
        console.log("receive: ", arguments);
        this._router.navigate(['FlogoFlowsDetailTaskAdd']);
        console.groupEnd();
      }.bind(this)
    });

    this._postService.subscribe({
      channel: "flogo.flows.detail.graphic",
      topic: "select-task",
      callback: function(){
        console.group("FlogoNavbarComponent -> select task");
        console.log("receive: ", arguments);
        this._router.navigate(['FlogoFlowsDetailTaskDetail', {id:1}]);
        console.groupEnd();
      }.bind(this)
    });
  }

  public tasks: IFlogoTaskDictionary;
  public diagram: IFlogoDiagram;

  public onAfterAddTask: EventEmitter < any > ;
  public onAfterEditTask: EventEmitter < any > ;

  constructor(
    private _postService: PostService,
    private _routerParams: RouteParams,
    private _router: Router
  ) {
    this.tasks = TASKS;
    this.diagram = DIAGRAM;
    this.onAfterAddTask = new EventEmitter( );
    this.onAfterEditTask = new EventEmitter( );
    this.initSubscribe();
  }


  addTask( $event: any ) {
    console.group( 'Add task' );

    // create a new task
    let newTask = {
      'id': btoa( 'FlogoTask::' + Date.now( ) ),
      'type': FLOGO_TASK_TYPE.TASK,
      'activityType': FLOGO_ACTIVITY_TYPE.REST,
      'name': 'Task',
      'attributes': {
        'inputs': [
          { 'type': FLOGO_ATTRIBUTE_TYPE.STRING, 'name': 'uri', 'value': 'http://petstore.swagger.io/v2/pet/{petId}' },
          { 'type': FLOGO_ATTRIBUTE_TYPE.STRING, 'name': 'method', 'value': 'GET' },
          { 'type': FLOGO_ATTRIBUTE_TYPE.STRING, 'name': 'petId', 'value': '' }
        ],
        'outputs': [
          { 'type': FLOGO_ATTRIBUTE_TYPE.STRING, 'name': 'result', 'value': '' }
        ]
      },
      'inputMappings': [
        { 'type': 1, 'value': 'petId', 'mapTo': 'petId' }
      ],
      'outputMappings': [
        { 'type': 1, 'value': 'result', 'mapTo': 'petInfo' }
      ]
    };
    this.tasks[ newTask.id ] = newTask;

    this.onAfterAddTask.emit( {
      node: $event.detail.node,
      task: newTask
    } );

    console.groupEnd( );
  }

  editTask( $event: any ) {
    console.group( 'Edit task' );

    console.log( $event );

    this.onAfterEditTask.emit( {
      msg: 'TODO'
    } );

    console.groupEnd( );
  }
}

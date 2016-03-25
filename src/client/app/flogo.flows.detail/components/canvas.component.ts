import { Component, EventEmitter } from 'angular2/core';
import { RouteConfig, RouterOutlet } from 'angular2/router';
import { FlogoCanvasFlowComponent } from '../../flogo.flows.detail.graphic/components/flow.component';
import { FlogoFlowsDetailDiagramComponent } from '../../flogo.flows.detail.diagram/components';


import { FlogoDiagram, IFlogoTaskDictionary, IFlogoDiagram, FLOGO_TASK_TYPE, FLOGO_ATTRIBUTE_TYPE, FLOGO_ACTIVITY_TYPE, FLOGO_NODE_TYPE } from '../../models';

import { DIAGRAM, TASKS, TEST_DIAGRAM, TEST_TASKS } from '../../mocks';

@Component( {
  selector: 'flogo-canvas',
  moduleId: module.id,
  directives: [ RouterOutlet, FlogoCanvasFlowComponent, FlogoFlowsDetailDiagramComponent ],
  templateUrl: 'canvas.tpl.html',
  styleUrls: [ 'canvas.component.css' ]
} )

//@RouteConfig([
//  {path:'/add',    name: 'FlogoCanvas',   component: FlogoCanvas}
//])

export class FlogoCanvasComponent {

  public tasks: IFlogoTaskDictionary;
  public diagram: IFlogoDiagram;

  public onAfterAddTask: EventEmitter < any > ;
  public onAfterEditTask: EventEmitter < any > ;

  constructor( ) {
    this.tasks = TASKS;
    this.diagram = DIAGRAM;
    this.onAfterAddTask = new EventEmitter( );
    this.onAfterEditTask = new EventEmitter( );
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

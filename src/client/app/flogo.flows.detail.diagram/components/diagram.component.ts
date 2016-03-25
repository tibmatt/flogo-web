import { Component, ElementRef, AfterViewInit, OnDestroy } from 'angular2/core';
import { FlogoDiagram, IFlogoTaskDictionary, IFlogoDiagram, FLOGO_TASK_TYPE, FLOGO_ATTRIBUTE_TYPE, FLOGO_ACTIVITY_TYPE, FLOGO_NODE_TYPE } from '../models';

import { DIAGRAM, TASKS, TEST_DIAGRAM, TEST_TASKS } from '../mocks';

@Component( {
  selector: 'flogo-canvas-flow-diagram',
  moduleId: module.id,
  templateUrl: 'diagram.tpl.html',
  styleUrls: [ 'diagram.component.css' ],
} )
export class FlogoFlowsDetailDiagramComponent implements AfterViewInit {

  // TODO
  //   make these as Inputs
  public tasks: IFlogoTaskDictionary;
  public diagram: IFlogoDiagram;

  private elmRef: ElementRef;
  private _diagram: FlogoDiagram;

  constructor( elementRef: ElementRef ) {
    this.elmRef = elementRef;
    // TODO
    //   remove these mock assignments after making them as Input of the components
    this.tasks = TASKS;
    this.diagram = DIAGRAM;
  }

  ngAfterViewInit( ) {
    this._diagram = new FlogoDiagram( this.diagram, this.tasks, this.elmRef.nativeElement );
    this._diagram.render( );
  }

  // mock implementation
  addTask( $event: any ) {
    console.group( 'Add task' );

    console.log( $event );

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

    // link the new task to FlogoNode
    this._diagram.linkNodeWithTask( $event.detail.node.id, newTask ).then( ( diagram ) => {
      return diagram.updateAndRender( {
        tasks: this.tasks
      } );
    } );

    console.groupEnd( );
  }

  // mock implementation
  editTask( $event: any ) {
    console.group( 'Edit task' );

    console.log( $event );

    console.groupEnd( );
  }
}

import {
  Component,
  ElementRef,
  OnChanges,
  SimpleChange,
  AfterViewInit,
  OnDestroy,
  EventEmitter
} from 'angular2/core';

import {
  FlogoDiagram,
  IFlogoTaskDictionary,
  IFlogoDiagram,
  FLOGO_TASK_TYPE,
  FLOGO_ATTRIBUTE_TYPE,
  FLOGO_ACTIVITY_TYPE,
  FLOGO_NODE_TYPE
} from '../models';

import * as DEMO_MODELS from '../models';

@Component( {
  selector: 'flogo-canvas-flow-diagram',
  moduleId: module.id,
  templateUrl: 'diagram.tpl.html',
  styleUrls: [ 'diagram.component.css' ],
  inputs: [ 'tasks', 'diagram', 'onAfterAddTask', 'onAfterEditTask' ],
  outputs: [ 'onAddTask', 'onEditTask' ]
} )
export class FlogoFlowsDetailDiagramComponent implements AfterViewInit {

  public tasks: IFlogoTaskDictionary;
  public diagram: IFlogoDiagram;

  public onAddTask: EventEmitter < any > ;
  public onEditTask: EventEmitter < any > ;
  public onAfterAddTask: EventEmitter < any > ;
  public onAfterEditTask: EventEmitter < any > ;

  private _elmRef: ElementRef;
  private _diagram: FlogoDiagram;
  private _afterAddTaskSub: any;
  private _afterEditTaskSub: any;

  // TODO
  //   remove this mock
  private _mockProcess: any;

  constructor( elementRef: ElementRef ) {
    this._elmRef = elementRef;
    this.onAddTask = new EventEmitter( );
    this.onEditTask = new EventEmitter( );
  }

  ngAfterViewInit( ) {
    this._diagram = new FlogoDiagram( this.diagram, this.tasks, this._elmRef.nativeElement );

    this._diagram.render( ).then( ( diagram ) => {
      // TODO
      //   remove this mock
      this._mockProcess = diagram.toProcess( );
    } );

    this._afterAddTaskSub = this.onAfterAddTask.subscribe( this._afterAddTaskHandler.bind( this ), ( err: any ) => {
      console.log( err );
    }, ( done: any ) => {
      console.log( done );
    } );

    this._afterEditTaskSub = this.onAfterEditTask.subscribe( this._afterEditTaskHandler.bind( this ), ( err: any ) => {
      console.log( err );
    }, ( done: any ) => {
      console.log( done );
    } );
  }

  ngOnChanges( changes: {
    [ propKey: string ]: SimpleChange
  } ) {

    console.log( changes );

    // TODO
    //   WARN: multiple rendering warning:
    //     note that these change monitor may trigger render while the
    //     subscriptions of onAfterEditTask and onAfterAddTask may do the same thing.
    //     may need optimisation later
    // only trigger the render for single time per change
    // monitor the updates of diagram
    if ( changes[ 'diagram' ] ) {

      console.groupCollapsed( 'Updated diagram' );
      console.log( this.diagram );
      console.groupEnd( );

      if ( this.diagram && this.tasks && this._diagram ) {
        this._diagram.updateAndRender( {
          tasks: this.tasks,
          diagram: this.diagram
        } ).then( ( diagram ) => {
          // TODO
          //   remove this mock
          this._mockProcess = diagram.toProcess( );
        } );
      }

      // monitor the updates of tasks
    } else if ( changes[ 'tasks' ] ) {

      console.groupCollapsed( 'Updated tasks' );
      console.log( this.tasks );
      console.groupEnd( );

      if ( this.diagram && this.tasks && this._diagram ) {
        this._diagram.updateAndRender( {
          tasks: this.tasks
        } ).then( ( diagram ) => {
          // TODO
          //   remove this mock
          this._mockProcess = diagram.toProcess( );
        } );;
      }
    }

  }

  private _afterAddTaskHandler( data: any ) {

    console.group( '_afterAddTaskHandler' );
    console.log( data );

    if ( data.node && data.task ) {
      // link the new task to FlogoNode
      this._diagram.linkNodeWithTask( data.node.id, data.task ).then( ( diagram ) => {
        return diagram.updateAndRender( {
          tasks: this.tasks
        } );
      } ).then( ( diagram ) => {
        // TODO
        //   remove this mock
        this._mockProcess = diagram.toProcess( );
      } );;
    }

    console.groupEnd( );
  }

  private _afterEditTaskHandler( data: any ) {

    console.group( '_afterEditTaskHandler' );
    console.log( data );

    // the tasks should have been passed into this component after changing
    // so re-render the diagram
    this._diagram.updateAndRender( {
      tasks: this.tasks
    } ).then( ( diagram ) => {
      // TODO
      //   remove this mock
      this._mockProcess = diagram.toProcess( );
    } );;

    // TODO
    //   if there are nodes position changing, then should apply the new diagram when updating
    // this._diagram.updateAndRender( {
    //   tasks: this.tasks,
    //   diagram: this.diagram
    // } );

    console.groupEnd( );
  }

  ngOnDestroy( ) {
    // clean up subscriptions
    this._afterAddTaskSub.unsubscribe( );
    this._afterEditTaskSub.unsubscribe( );
  }

  // forwarding event
  addTask( $event: any ) {
    this.onAddTask.emit( $event );
  }

  // forwarding event
  editTask( $event: any ) {
    this.onEditTask.emit( $event );
  }

  getEnumerations( ): any {
    return DEMO_MODELS;
  }
}

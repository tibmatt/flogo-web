import { Component, ElementRef, SimpleChange, AfterViewInit } from 'angular2/core';
import * as DEMO_MODELS from '../models';
import { FlogoFlowDiagram, IFlogoFlowDiagramTaskDictionary, IFlogoFlowDiagram, FLOGO_NODE_TYPE } from '../models';
import { PostService } from '../../../common/services/post.service';
import { PUB_EVENTS } from '../messages';

@Component(
  {
    selector : 'flogo-canvas-flow-diagram',
    moduleId : module.id,
    templateUrl : 'diagram.tpl.html',
    styleUrls : [ 'diagram.component.css' ],
    inputs : [
      'tasks',
      'diagram'
    ]
  }
)
export class FlogoFlowsDetailDiagramComponent implements AfterViewInit {

  public tasks : IFlogoFlowDiagramTaskDictionary;
  public diagram : IFlogoFlowDiagram;

  private _elmRef : ElementRef;
  private _diagram : FlogoFlowDiagram;
  private _subscriptions : any[ ];

  // TODO
  //   remove this mock
  private _mockProcess : any;

  constructor( elementRef : ElementRef, private _postService : PostService ) {
    this._elmRef = elementRef;
    this.initSub();
  }

  private initSub() {
    if ( _.isEmpty( this._subscriptions ) ) {
      this._subscriptions = [];
    }

    if ( !this._postService ) {
      console.error( 'No PostService Found..' );
      return;
    }

    let subs = [
      {
        channel : 'mock-flogo-flows-detail-diagram',
        topic : 'add-trigger-done',
        callback : this._addTriggerDone.bind( this )
      },
      {
        channel : 'mock-flogo-flows-detail-diagram',
        topic : 'select-trigger-done',
        callback : this._selectTriggerDone.bind( this )
      },
      {
        channel : 'mock-flogo-flows-detail-diagram',
        topic : 'add-task-done',
        callback : this._addTaskDone.bind( this )
      },
      {
        channel : 'mock-flogo-flows-detail-diagram',
        topic : 'select-task-done',
        callback : this._selectTaskDone.bind( this )
      }
    ];

    _.each(
      subs, ( sub ) => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }

  private unsub() {
    if ( _.isEmpty( this._subscriptions ) ) {
      return true;
    }

    _.each(
      this._subscriptions, ( sub ) => {
        this._postService.unsubscribe( sub );
      }
    );

    return true;
  }

  ngAfterViewInit() {
    // this._diagram = new FlogoFlowDiagram( this.diagram, this.tasks, this._elmRef.nativeElement );

    // TODO
    //   remove this mock, this is for evaluating empty diagram case
    this._diagram = new FlogoFlowDiagram( null, this.tasks, this._elmRef.nativeElement );

    this._diagram.render()
      .then(
        ( diagram ) => {
          // TODO
          //   remove this mock
          this._mockProcess = diagram.toProcess();
        }
      );

    // TODO
    //   subscription

  }

  ngOnChanges(
    changes : {
      [ propKey : string ] : SimpleChange
    }
  ) {

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
      console.groupEnd();

      if ( this.diagram && this.tasks && this._diagram ) {
        this._diagram.updateAndRender(
          {
            tasks : this.tasks,
            diagram : this.diagram
          }
          )
          .then(
            ( diagram ) => {
              // TODO
              //   remove this mock
              this._mockProcess = diagram.toProcess();
            }
          );
      }

      // monitor the updates of tasks
    } else if ( changes[ 'tasks' ] ) {

      console.groupCollapsed( 'Updated tasks' );
      console.log( this.tasks );
      console.groupEnd();

      if ( this.diagram && this.tasks && this._diagram ) {
        this._diagram.updateAndRender(
          {
            tasks : this.tasks
          }
          )
          .then(
            ( diagram ) => {
              // TODO
              //   remove this mock
              this._mockProcess = diagram.toProcess();
            }
          );
        ;
      }
    }

  }

  private _afterEditTaskHandler( data : any ) {

    console.group( '_afterEditTaskHandler' );
    console.log( data );

    // the tasks should have been passed into this component after changing
    // so re-render the diagram
    this._diagram.updateAndRender(
      {
        tasks : this.tasks
      }
      )
      .then(
        ( diagram ) => {
          // TODO
          //   remove this mock
          this._mockProcess = diagram.toProcess();
        }
      );
    ;

    // TODO
    //   if there are nodes position changing, then should apply the new diagram when updating
    // this._diagram.updateAndRender( {
    //   tasks: this.tasks,
    //   diagram: this.diagram
    // } );

    console.groupEnd();
  }

  ngOnDestroy() {
    // TODO

    this.unsub();
  }

  // forwarding event
  addTask( $event : any ) {
    // TODO
    console.group( 'forwarding add task event' );

    console.log( $event );

    let data = $event.detail;

    if ( data.node.type === FLOGO_NODE_TYPE.NODE_ROOT_NEW ) {
      // add trigger event
      this._postService.publish( _.assign( {}, PUB_EVENTS.addTrigger, { data : data } ) );
    } else if ( data.node.type === FLOGO_NODE_TYPE.NODE_ADD ) {
      // add task event
      this._postService.publish( _.assign( {}, PUB_EVENTS.addTask, { data : data } ) );
    } else {
      console.warn( 'unknown event type' );
    }

    console.groupEnd();
  }

  // forwarding event
  selectTask( $event : any ) {
    // TODO

    console.group( 'forwarding select task event' );

    console.log( $event );

    let data = $event.detail;

    // TODO
    //   need to support branch/link and other nodes
    if ( data.node.type === FLOGO_NODE_TYPE.NODE_ROOT ) {
      // select trigger event
      this._postService.publish( _.assign( {}, PUB_EVENTS.selectTrigger, { data : data } ) );
    } else if ( data.node.type === FLOGO_NODE_TYPE.NODE ) {
      // select task event
      this._postService.publish( _.assign( {}, PUB_EVENTS.selectTask, { data : data } ) );
    } else {
      console.warn( 'unknown event type, yet' );
    }

    console.groupEnd();
  }


  private _addTriggerDone( data : any, envelope : any ) {
    console.group( 'Add Trigger Done' );

    console.log( data );
    console.log( envelope );

    this._associateNodeWithTaskAndUpdateDiagram( data );

    console.groupEnd();
  }

  private _addTaskDone( data : any, envelope : any ) {
    console.group( 'Add Task Done' );

    console.log( data );
    console.log( envelope );

    this._associateNodeWithTaskAndUpdateDiagram( data );

    console.groupEnd();
  }

  private _selectTriggerDone( data : any, envelope : any ) {
    console.group( 'Select Trigger Done' );

    console.log( data );
    console.log( envelope );

    this._associateNodeWithTaskAndUpdateDiagram( data );

    console.groupEnd();
  }

  private _selectTaskDone( data : any, envelope : any ) {
    console.group( 'Select task Done' );

    console.log( data );
    console.log( envelope );

    this._associateNodeWithTaskAndUpdateDiagram( data );


    console.groupEnd();
  }

  private _associateNodeWithTaskAndUpdateDiagram( data : any ) {
    if ( data.node && data.task ) {
      // link the new task to FlogoFlowDiagramNode
      this._diagram.linkNodeWithTask( data.node.id, data.task )
        .then(
          ( diagram ) => {
            return diagram.updateAndRender(
              {
                tasks : this.tasks
              }
            );
          }
        )
        .then(
          ( diagram ) => {
            // TODO
            //   remove this mock
            this._mockProcess = diagram.toProcess();
          }
        );
    }
  }

  getEnumerations() : any {
    return DEMO_MODELS;
  }
}

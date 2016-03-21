import { Component, OnChanges, SimpleChange, ElementRef, Inject, EventEmitter } from 'angular2/core';

import { FGTaskDictionary, FGDiagram, FGTask, FGNode, FGNodeType, FGNodeLocation, FGTaskInputs, FGTaskOutputs } from '../models';

import { FGDiagramService } from '../fg-diagram/fg-diagram.service';

@Component( {
  selector: 'fg-task-panel',
  templateUrl: './app/fg-task-panel/fg-task-panel.component.html',
  styleUrls: [ './app/fg-task-panel/fg-task-panel.component.css' ],
  outputs: [ 'afterModify' ],
  inputs: [ 'diagram', 'tasks', 'currentNode' ]
} )
export class FGTaskPanel implements OnChanges {

  public diagram: FGDiagram;
  public tasks: FGTaskDictionary;
  public currentNode: FGNode;

  public afterModify: EventEmitter < any > ;

  private elmRef: ElementRef;
  private currentTask: FGTask;

  private inputs: FGTaskInputs;
  private inputsKeys: string[ ];
  private outputs: FGTaskOutputs;
  private outputsKeys: string[ ];
  private newInputs: FGTaskInputs;
  private newInputsKeys: string[ ];
  private newOutputs: FGTaskOutputs;
  private newOutputsKeys: string[ ];
  private locParentsStr: string;
  private locChildrenStr: string;

  constructor( @Inject( ElementRef ) elementRef: ElementRef, private fgDiagramService: FGDiagramService ) {
    this.elmRef = elementRef;
    this.afterModify = new EventEmitter( );
  }

  ngOnChanges( changes: {
    [ propKey: string ]: SimpleChange
  } ) {

    // monitor the updates of the current task
    if ( changes[ 'currentNode' ] ) {

      console.group( 'Updated currentNode' );
      console.log( this.currentNode );
      console.groupEnd( );

      if ( this.currentNode ) {
        this.currentTask = _.cloneDeep( this.tasks[ this.diagram.nodes[ this.currentNode.id ].taskID ] );
      } else {
        this.currentTask = null;
      }

      if ( this.currentTask ) {
        this.showPanel( );
      } else {
        this.hidePanel( );
      }
    }
  }

  showPanel( ) {

    this.inputs = this.currentTask.attrs.inputs;
    this.outputs = this.currentTask.attrs.outputs;
    this.inputsKeys = _.keys( this.inputs );
    this.outputsKeys = _.keys( this.outputs );

    this.newOutputs = {}
    this.newOutputsKeys = [ ];
    this.newInputs = {}
    this.newInputsKeys = [ ];

    this.locParentsStr = this.currentNode.parents.join( ', ' );
    this.locChildrenStr = this.currentNode.children.join( ', ' );

    let panel = $( this.elmRef.nativeElement )
      .children( '.fg-task-modal' );
    if ( panel ) {
      panel.modal( 'show' );
    }
  }

  hidePanel( ) {
    let panel = $( this.elmRef.nativeElement )
      .children( '.fg-task-modal' );

    if ( panel ) {
      panel.modal( 'hide' );
    }
  }

  onClose( evt: Event ) {
    console.group( 'On task panel close' );
    console.groupEnd( );

    this.hidePanel( );

    this.afterModify.emit( {
      task: null,
      node: null
    } );
  }

  onApply( evt: Event ) {
    console.group( 'On task panel apply change' );
    console.groupEnd( );

    this.hidePanel( );

    // TODO verification
    this.currentNode.parents = _.map( this.locParentsStr.split( ',' ), ( d: string ) => {
      return d.trim( );
    } );
    this.currentNode.children = _.map( this.locChildrenStr.split( ',' ), ( d: string ) => {
      return d.trim( );
    } );

    _.each( this.newInputsKeys, ( key: string ) => {
      this.inputs[ key ] = _.cloneDeep( this.newInputs[ key ] );
    } );

    _.each( this.newOutputsKeys, ( key: string ) => {
      this.outputs[ key ] = _.cloneDeep( this.newOutputs[ key ] );
    } );

    this.afterModify.emit( {
      task: this.currentTask,
      node: this.currentNode
    } );
  }

  addTask( ) {
    this.currentTask = {
      id: 'task' + Date.now( ),
      name: 'new task',
      attrs: {
        inputs: {},
        outputs: {}
      }
    }

    this.currentNode = {
      id: 'n' + Date.now( ),
      taskID: this.currentTask.id,
      type: FGNodeType.TASK,
      parents: [ ],
      children: [ ]
    }
    this.showPanel( );
  }

  addOutput( ) {
    let newOutputsKey = 'newOutput' + Date.now( );
    this.newOutputsKeys.push( newOutputsKey )
    this.newOutputs[ newOutputsKey ] = '';
  }

  addInput( ) {
    let newInputsKey = 'newInput' + Date.now( );
    this.newInputsKeys.push( newInputsKey );
    this.newInputs[ newInputsKey ] = '';
  }

}

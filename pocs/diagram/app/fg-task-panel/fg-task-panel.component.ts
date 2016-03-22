import { Component, OnChanges, SimpleChange, ElementRef, Inject, EventEmitter } from 'angular2/core';

import { FGTaskDictionary, FGDiagram, FGTask, FGNode, FGNodeType, FGNodeLocation, FGTaskInputs, FGTaskOutputs } from '../models';

import { FGDiagramService } from '../fg-diagram/fg-diagram.service';

@Component( {
  selector: 'fg-task-panel',
  templateUrl: './app/fg-task-panel/fg-task-panel.component.html',
  styleUrls: [ './app/fg-task-panel/fg-task-panel.component.css' ],
  outputs: [ 'afterModify' ],
  inputs: [ 'diagram', 'tasks', 'currentNodeID' ]
} )
export class FGTaskPanel implements OnChanges {

  public diagram: FGDiagram;
  public tasks: FGTaskDictionary;
  public currentNodeID: string;

  public afterModify: EventEmitter < any > ;

  private elmRef: ElementRef;
  private currentTask: FGTask;
  private currentNode: FGNode;

  private currentParent: string; // id of the current non-branch/non-link parent
  private currentChildren: string; // id of the current non-branch/non-link children

  private validParents: string[ ];
  private validChildren: string[ ];

  private isRootNode: boolean;

  private inputs: any[ ];
  private outputs: any[ ];

  constructor( @Inject( ElementRef ) elementRef: ElementRef, private fgDiagramService: FGDiagramService ) {
    this.elmRef = elementRef;
    this.afterModify = new EventEmitter( );
  }

  ngOnChanges( changes: {
    [ propKey: string ]: SimpleChange
  } ) {

    // monitor the updates of the current task
    if ( changes[ 'currentNodeID' ] ) {

      console.group( 'Updated currentNodeID' );
      console.log( this.currentNodeID );
      console.groupEnd( );

      if ( this.currentNodeID ) {
        this.currentNode = _.cloneDeep( this.diagram.nodes[ this.currentNodeID ] );
        this.currentTask = _.cloneDeep( this.tasks[ this.diagram.nodes[ this.currentNode.id ].taskID ] );

        if ( this.currentNode.type === FGNodeType.ROOT ) {
          this.isRootNode = true;
        } else {
          this.isRootNode = false;
        }
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

  private initData( ) {
    this.inputs = [ ];
    this.outputs = [ ];
    this.currentParent = '';
    this.currentChildren = '';

    _.forIn( this.currentTask.attrs.inputs, ( value: any, key: string ) => {
      this.inputs.push( {
        key: key,
        value: value
      } );
    } );

    _.forIn( this.currentTask.attrs.outputs, ( value: any, key: string ) => {
      this.outputs.push( {
        key: key,
        value: value
      } );
    } );

    let indirectParentTypes = [ FGNodeType.LINK, FGNodeType.BRANCH ];
    _.some( this.currentNode.parents, ( d: string ) => {

      if ( indirectParentTypes.indexOf( this.diagram.nodes[ d ].type ) === -1 ) {
        this.currentParent = d;

        return true;
      }

      return false;
    } );

    // get the single non-branch/non-link children
    // TODO
    //   how to handle multiple children
    _.some( this.currentNode.children, ( d: string ) => {

      if ( indirectParentTypes.indexOf( this.diagram.nodes[ d ].type ) === -1 ) {
        this.currentChildren = d;

        return true;
      }

      return false;
    } );

    this.validParents = this.fgDiagramService.getValidParents( {
      node: this.diagram.nodes[ this.currentNode.id ] || this.currentNode,
      diagram: this.diagram
    } );

    this.validParents.push( this.currentParent );
    this.validParents = _.uniq( this.validParents );

    this.validChildren = this.fgDiagramService.getValidChildren( {
      node: this.diagram.nodes[ this.currentNode.id ] || this.currentNode,
      diagram: this.diagram
    } );

    this.validChildren.push( this.currentChildren );
    this.validChildren = _.uniq( this.validChildren );

  }

  showPanel( ) {
    this.initData( );

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

    _.each( this.inputs, ( input: any ) => {
      this.currentTask.attrs.inputs[ input.key ] = input.value;
    } );

    _.each( this.outputs, ( output: any ) => {
      this.currentTask.attrs.outputs[ output.key ] = output.value;
    } );

    // get the new location information
    let newLoc: FGNodeLocation = null;

    // if the parent of is changed
    if ( this.currentParent && this.currentNode.parents.indexOf( this.currentParent ) === -1 ) {
      newLoc = {
        parents: [ this.currentParent ],
        children: [ ]
      };

      // change the children at the same time
      if ( this.currentChildren && this.currentNode.children.indexOf( this.currentChildren ) === -1 ) {
        newLoc.children = [ this.currentChildren ];
      }
    }

    // apply changes on the node

    this.afterModify.emit( {
      task: this.currentTask,
      node: this.currentNode,
      loc: newLoc
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
    this.outputs.push( {
      key: newOutputsKey,
      value: ''
    } );
  }

  addInput( ) {
    let newInputsKey = 'newInput' + Date.now( );
    this.inputs.push( {
      key: newInputsKey,
      value: ''
    } );
  }

  getTaskNameByNodeID( nodeID: string ) {
    let taskName = 'not assigned';
    let node = this.diagram.nodes[ nodeID ];

    if ( node ) {
      taskName = this.tasks[ node.taskID ].name;
    }

    return taskName;
  }

}

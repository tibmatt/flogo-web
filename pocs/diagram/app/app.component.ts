import { Component } from 'angular2/core';
import { FGDiagramComponent } from './fg-diagram/fg-diagram.component';
import { FGTaskPanel } from './fg-task-panel/fg-task-panel.component';
import { FGTaskDictionary, FGDiagram, FGNode, FGTask } from './models';
import { FGTaskService } from './common/fg-task.service';

// mock
// TODO remove this.
import { DIAGRAM1, TASKS1 } from './mock';

import { FGDiagramService } from './fg-diagram/fg-diagram.service';

@Component( {
  selector: 'fg-app',
  templateUrl: './app/app.component.html',
  styleUrls: [ './app/app.component.css' ],
  directives: [ FGDiagramComponent, FGTaskPanel ],
  providers: [ FGTaskService, FGDiagramService ]
} )
export class FGAppComponent {

  tasks: FGTaskDictionary;
  diagram: FGDiagram;
  _diagram: FGDiagram;
  _tasks: FGTaskDictionary;
  currentNode: FGNode;

  constructor( private _taskService: FGTaskService, private _diagramService: FGDiagramService ) {
    _taskService.getTasks( )
      .then( ( tasks: FGTaskDictionary ) => {
        this.tasks = tasks;
        this._tasks = tasks;
      } );
    _taskService.getDiagram( )
      .then( ( diagram: FGDiagram ) => {
        this.diagram = diagram;
        this._diagram = diagram;
      } );
  }

  swapDiagram( ) {
    if ( _.isEqual( this.diagram, DIAGRAM1 ) ) {
      this.diagram = this._diagram;
    } else {
      this.diagram = DIAGRAM1;
    }
  }

  swapTasks( ) {
    if ( _.isEqual( this.tasks, TASKS1 ) ) {
      this.tasks = this._tasks;
    } else {
      this.tasks = TASKS1;
    }
  }

  onFGNodeClick( data: {
    node: FGNode,
    col: number,
    row: number
  } ) {
    console.group( 'onFGNodeClick' );

    console.log( data );

    this.currentNode = this.diagram.nodes[ data.node.id ];

    console.groupEnd( );
  }

  afterModify( data: {
    node: FGNode,
    task: FGTask
  } ) {
    console.group( 'afterModify' );

    console.log( data );

    if ( data.node ) {
      // update node info
      let node = this.diagram.nodes[ data.node.id ];

      if ( node ) {
        this._diagramService.updateNode( {
          node: node,
          diagram: this.diagram
        } );
      } else {
        this._diagramService.addNode( {
          node: node,
          diagram: this.diagram
        } );
      }
    }

    if ( data.task ) {
      // update task info
      this.tasks[ data.task.id ] = data.task;

      // force refresh
      // TODO replace this with proper logic
      this.tasks = _.cloneDeep( this.tasks );
    }

    this.currentNode = null;

    console.groupEnd( );
  }
}

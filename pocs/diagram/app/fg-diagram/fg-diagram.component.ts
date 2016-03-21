import { Component, OnChanges, SimpleChange, ElementRef, Inject, EventEmitter } from 'angular2/core';

// import * as d3 from 'd3';
import { Selection } from 'd3';

import { FGTaskDictionary, FGDiagram, FGTask, FGNode, FGNodeType, FGNodeLocation } from '../models';

import { FGDiagramService } from './fg-diagram.service';


@Component( {
  selector: 'fg-diagram',
  templateUrl: './app/fg-diagram/fg-diagram.component.html',
  styleUrls: [ './app/fg-diagram/fg-diagram.component.css' ],
  outputs: [ 'onFGNodeClick' ],
  inputs: [ 'diagram', 'tasks' ]
} )
export class FGDiagramComponent implements OnChanges {

  public diagram: FGDiagram;
  public tasks: FGTaskDictionary;
  public onFGNodeClick: EventEmitter < any > ;

  private matrix: string[ ][ ];
  private rootElm: Selection < any > ;
  private elmRef: ElementRef;

  private ng2StyleAttr = '';

  constructor( @Inject( ElementRef ) elementRef: ElementRef, private fgDiagramService: FGDiagramService ) {
    this.elmRef = elementRef;
    this.onFGNodeClick = new EventEmitter( );
  }

  ngOnChanges( changes: {
    [ propKey: string ]: SimpleChange
  } ) {

    console.log( changes );

    // only trigger the render for single time per change
    // monitor the updates of diagram
    if ( changes[ 'diagram' ] ) {

      console.groupCollapsed( 'Updated diagram' );
      console.log( this.diagram );
      console.groupEnd( );

      if ( this.diagram && this.tasks ) {
        this.update( );
      }

      // monitor the updates of tasks
    } else if ( changes[ 'tasks' ] ) {

      console.groupCollapsed( 'Updated tasks' );
      console.log( this.tasks );
      console.groupEnd( );

      if ( this.diagram && this.tasks ) {
        this.render( );
      }
    }

  }

  private update( ) {
    console.group( 'updating...' );

    this.matrix = this.fgDiagramService.transformDiagram( this.diagram );

    console.group( 'Updated matrix' );
    // console.table( this.matrix );
    console.log( this.matrix );
    console.groupEnd( );

    this.render( );

    console.groupEnd( );
  }

  private render( ) {
    console.group( 'rendering...' );
    let el = this.elmRef.nativeElement;

    this.rootElm = d3.select( el )
      .select( '.fg-diagram' );

    !this.ng2StyleAttr && this.updateNG2StyleAttr( );

    // enter selection
    let rows = this.rootElm.selectAll( '.fg-diagram-row' )
      .data( this.matrix );

    let enterRows = rows
      .enter( )
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'fg-diagram-row', true );

    enterRows.style( 'opacity', 1e-6 )
      .transition( )
      .duration( 350 )
      .style( 'opacity', 1 );

    // enter selection
    let tasks = this.preprocessTaskNodes( enterRows );

    this.handleTaskNodes( tasks );

    // update selection
    rows.classed( 'updated', true );
    tasks = this.preprocessTaskNodes( rows );

    this.handleTaskNodes( tasks );

    // exit selection
    rows.exit( )
      .classed( {
        'updated': false,
        'exit': true
      } )
      .transition( )
      .duration( 350 )
      .delay( 350 )
      .style( 'opacity', 1e-6 )
      .remove( );

    console.groupEnd( );
  }

  private updateNG2StyleAttr( ) {
    let el = this.elmRef.nativeElement.getElementsByClassName( 'fg-diagram' );
    let ng2StyleAttrReg = /^_ngcontent\-.*$/g

    if ( el && el.length ) {
      Array.prototype.some.call( el[ 0 ].attributes, ( attr: any, idx: number ) => {

        if ( ng2StyleAttrReg.test( attr.name ) ) {
          this.ng2StyleAttr = attr.name;

          return true;
        }

        return false;
      } );

      return true;
    }

    return false;
  }

  private preprocessTaskNodes( rows: any ) {
    return rows.selectAll( '.fg-diagram-node' )
      .data( ( d: FGNode[ ], i: number ) => {
        return _.map( d, ( nodeID: string ) => {
          return this.diagram.nodes[ nodeID ];
        } );
      } );
  }

  private handleTaskNodes( tasks: any ) {
    // enter selection
    tasks.enter( )
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'fg-diagram-node', true )
      .on( 'click', ( d: FGNode, col: number, row: number ) => {
        console.group( 'on click' );

        console.group( 'node data' );
        // console.table( d );
        console.log( d );
        console.groupEnd( );

        if ( d.taskID ) {
          console.group( 'task data' );
          console.log( this.tasks[ d.taskID ] );
          console.groupEnd( );
        }

        console.group( 'location in matrix' );
        console.log( `row: ${row+1}, col: ${col+1}` );
        console.groupEnd( );

        this.onFGNodeClick.emit( {
          node: d,
          col: col,
          row: row
        } );

        console.groupEnd( );
      } )
      .style( 'opacity', 1e-6 )
      .style( 'border-color', '#ff5500' )
      .transition( )
      .duration( 350 )
      .style( 'opacity', 1 )

    // update selection
    tasks.classed( 'updated', true )
      .attr( 'data-fg-node-type', ( d: FGNode ) => FGNodeType[ d.type ].toLowerCase( ) )
      .text( ( d: FGNode ) => {
        let task = this.tasks[ d.taskID ];

        return ( task && task.name ) || [ d.id, ' from ', d.parents, ' to ', d.children ].join( '' );
      } )
      .transition( )
      .duration( 350 )
      .delay( 350 )
      .style( 'border-color', '#fff' );

    // exit selection
    tasks.exit( )
      .classed( {
        'updated': false,
        'exit': true
      } )
      .transition( )
      .duration( 350 )
      .style( 'opacity', 1e-6 )
      .remove( );
  };

  // dummy implementation
  addNode( ) {
    console.group( 'Add Node' );
    let node: FGNode = {
      'id': 'f',
      'taskID': 'task f',
      'type': FGNodeType.TASK,
      'parents': < string[ ] > [ ],
      'children': < string[ ] > [ ]
    };
    let loc: FGNodeLocation = {
      parents: [ '2' ],
      children: [ '3' ]
    };

    this.fgDiagramService.addNode( {
        node: node,
        loc: loc,
        diagram: this.diagram
      } )
      .then( result => {
        if ( result ) {
          this.update( );
        }
      } )
      .catch( e => {
        console.warn( e );
      } );

    console.groupEnd( );
  }

  // dummy implementation
  // readNode( ) {
  //   console.group( 'Read Node' );

  //   console.groupEnd( );
  // }

  // dummy implementation
  updateNodeAppend( ) {
    console.group( 'Update Node Append' );

    /**
     * mock for moving a node by appending to the new parent
     */
    // node for appending the task
    let node: FGNode = {
      'id': 'f',
      'taskID': 'task f',
      'type': FGNodeType.TASK,
      'parents': < string[ ] > [ ],
      'children': < string[ ] > [ ]

    };

    // location for appending the task
    let loc: FGNodeLocation = {
      parents: [ '7' ],
      children: < any > [ ]
    };

    this.fgDiagramService.updateNode( {
        node: node,
        loc: loc,
        diagram: this.diagram
      } )
      .then( result => {
        if ( result ) {
          this.update( );
        }
      } )
      .catch( e => {
        console.warn( e );
      } );

    console.groupEnd( );
  }

  // dummy implementation
  updateNodeInject( ) {
    console.group( 'Update Node Inject' );

    /**
     * mock for moving a node by injecting to the new path
     */
    // node for injecting the task
    let node: FGNode = {
      'id': '4',
      'taskID': 'task 4',
      'type': FGNodeType.TASK,
      'parents': < string[ ] > [ ],
      'children': < string[ ] > [ ]
    };

    // location for injecting the task
    let loc: FGNodeLocation = {
      parents: [ '5' ],
      children: [ '6' ]
    };

    this.fgDiagramService.updateNode( {
        node: node,
        loc: loc,
        diagram: this.diagram
      } )
      .then( result => {
        if ( result ) {
          this.update( );
        }
      } )
      .catch( e => {
        console.warn( e );
      } );

    console.groupEnd( );
  }
}

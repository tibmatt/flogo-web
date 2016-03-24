import { IFlogoDiagramRootNode, IFlogoNodeDictionary, IFlogoTaskDictionary, IFlogoNode, FLOGO_NODE_TYPE } from '../models';

import { Selection } from 'd3';

export interface IFlogoDiagram {
  root: IFlogoDiagramRootNode;
  nodes: IFlogoNodeDictionary;
};

export class FlogoDiagram implements IFlogoDiagram {
  public root: IFlogoDiagramRootNode;
  public nodes: IFlogoNodeDictionary;

  private rootElm: Selection < any > ;
  private ng2StyleAttr = '';

  constructor( diagram: IFlogoDiagram, private tasks: IFlogoTaskDictionary, private elm: HTMLElement ) {
    // keep a copy of diagram information, but only keep the reference of the tasks
    this.root = _.cloneDeep( diagram.root );
    this.nodes = _.cloneDeep( diagram.nodes );
  }

  static transformDiagram( diagram: IFlogoDiagram ): string[ ][ ] {
    let matrix: string[ ][ ] = [ ];

    // find the root node
    let root: IFlogoNode; // diagram node
    if ( diagram && diagram.root && diagram.root.is ) {
      root = diagram.nodes[ diagram.root.is ];
    }

    // if there is no root, then it's an empty diagram
    if ( !root ) {
      return matrix;
    }

    // add the root to the first row of the matrix
    matrix.push( [ root.id ] );

    // handling children of root
    _insertChildNodes( matrix, diagram, root );

    console.groupCollapsed( 'matrix' );
    console.log( matrix );
    console.groupEnd( );

    return matrix;
  }

  public render( ) {
    console.group( 'rendering...' );
    let el = this.elm;

    this.rootElm = d3.select( el )
      .select( '.flogo-flows-detail-diagram' );

    !this.ng2StyleAttr && this.updateNG2StyleAttr( );

    // enter selection
    let rows = this.rootElm.selectAll( '.flogo-flows-detail-diagram-row' )
      .data( FlogoDiagram.transformDiagram( this ) );

    let enterRows = rows
      .enter( )
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'flogo-flows-detail-diagram-row', true );

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
    let el = this.elm.getElementsByClassName( 'flogo-flows-detail-diagram' );
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
    return rows.selectAll( '.flogo-flows-detail-diagram-node' )
      .data( ( d: IFlogoNode[ ], i: number ) => {
        return _.map( d, ( nodeID: string ) => {
          return this.nodes[ nodeID ];
        } );
      } );
  }

  private handleTaskNodes( tasks: any ) {
    // enter selection
    tasks.enter( )
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'flogo-flows-detail-diagram-node', true )
      .on( 'click', ( d: IFlogoNode, col: number, row: number ) => {
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

        // TODO
        // emit event
        console.log( {
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
      .attr( 'data-flogo-node-type', ( d: IFlogoNode ) => FLOGO_NODE_TYPE[ d.type ].toLowerCase( ) )
      .text( ( d: IFlogoNode ) => {
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
}

// helper function of transformMatrix function
//   if the item has multiple children, put the first non-branch node along with the item
//   create new row the the rest of the branch nodes
function _insertChildNodes( matrix: string[ ][ ], diagram: IFlogoDiagram, node: IFlogoNode ): string[ ][ ] {

  // deep-first traversal

  let curRowIdx = matrix.length - 1;

  if ( node.children.length ) {
    _.each( node.children, ( d: string, i: number ) => {
      if ( diagram.nodes[ d ].type !== FLOGO_NODE_TYPE.NODE_BRANCH ) {
        // push to the current row if it's non-branch node
        matrix[ curRowIdx ].push( d );
      } else {
        // create new row for branch node
        matrix.push( [ d ] );
      }

      // not follow the children of a link node
      if ( diagram.nodes[ d ].type !== FLOGO_NODE_TYPE.NODE_LINK ) {
        _insertChildNodes( matrix, diagram, diagram.nodes[ d ] );
      }

    } );
  }

  return matrix;
}

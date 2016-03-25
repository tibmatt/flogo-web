import { IFlogoDiagramRootNode, IFlogoNodeDictionary, IFlogoTaskDictionary, IFlogoNode, FlogoNode, FLOGO_NODE_TYPE, IFlogoTask } from '../models';

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
    this.updateDiagram( diagram );
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

  public update( opt: {
    diagram ? : IFlogoDiagram,
    tasks ? : IFlogoTaskDictionary,
    element ? : HTMLElement
  } ): Promise < FlogoDiagram > {
    let promises: Promise < FlogoDiagram > [ ] = [ ];

    if ( opt.diagram ) {
      promises.push( this.updateDiagram( opt.diagram ) );
    }

    if ( opt.tasks ) {
      promises.push( this.updateTasks( opt.tasks ) );
    }

    if ( opt.element ) {
      promises.push( this.updateElement( opt.element ) );
    }

    return Promise.all( promises ).then( ( ) => this );
  }

  public updateAndRender( opt: {
    diagram ? : IFlogoDiagram,
    tasks ? : IFlogoTaskDictionary,
    element ? : HTMLElement
  } ): Promise < FlogoDiagram > {
    return this.update( opt ).then( ( ) => {
      return this.render( );
    } );
  }

  public updateDiagram( diagram: IFlogoDiagram ): Promise < FlogoDiagram > {
    // keep a copy of diagram information, but only keep the reference of the tasks
    this.root = _.cloneDeep( diagram.root );

    // convert FlogoNode object into instance of FlogoNode class
    // if a node has no child, append a NODE_ADD node as its child
    //   TODO case of NODE_LINK should be considered differently
    let nodeDict: IFlogoNodeDictionary = {};
    let NODES_CAN_HAVE_ADD_NODE = [ FLOGO_NODE_TYPE.NODE_BRANCH, FLOGO_NODE_TYPE.NODE, FLOGO_NODE_TYPE.NODE_ROOT, FLOGO_NODE_TYPE.NODE_SUB_PROC, FLOGO_NODE_TYPE.NODE_LOOP ];

    _.forIn( diagram.nodes, ( node, nodeID ) => {
      let newNode = nodeDict[ nodeID ] = new FlogoNode( node );

      if ( newNode.hasNoChild( ) && NODES_CAN_HAVE_ADD_NODE.indexOf( newNode.type ) !== -1 ) {
        this._appendAddNode( nodeDict, < FlogoNode > newNode );
      }

    } );

    this.nodes = nodeDict;

    return Promise.resolve( this );
  }
  public updateTasks( tasks: IFlogoTaskDictionary ): Promise < FlogoDiagram > {
    this.tasks = tasks;
    return Promise.resolve( this );
  }

  public updateElement( elm: HTMLElement ): Promise < FlogoDiagram > {
    d3.select( this.elm ).select( '.flogo-flows-detail-diagram' ).selectAll( '.flogo-flows-detail-diagram-row' ).remove( ); // clean the previous diagram
    this.elm = elm;
    return Promise.resolve( this );
  }

  public render( ): Promise < FlogoDiagram > {
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

    // enterRows.style( 'opacity', 1e-6 )
    //   .transition( )
    //   .duration( 350 )
    //   .style( 'opacity', 1 );

    // enter selection
    let tasks = this.preprocessTaskNodes( enterRows );

    this.handleTaskNodes( tasks );

    // update selection
    rows.classed( 'updated', true )
    .on( 'mouseenter', function ( ) {
      d3.select( this ).classed( 'hover', true );
    } )
    .on( 'mouseleave', function ( ) {
      d3.select( this ).classed( 'hover', false );
    } )
    tasks = this.preprocessTaskNodes( rows );

    this.handleTaskNodes( tasks );

    // exit selection
    rows.exit( )
    .classed( {
      'updated': false,
      'exit': true
    } )
    .on( 'mouseenter', null )
    .on( 'mouseleave', null )
    // .transition( )
    // .duration( 350 )
    // .delay( 350 )
    // .style( 'opacity', 1e-6 )
    .remove( );

    console.groupEnd( );

    return Promise.resolve( this );
  }

  public linkNodeWithTask( nodeID: string, task: IFlogoTask ): Promise < FlogoDiagram > {
    let node = this.nodes[ nodeID ];

    if ( node ) {
      node.taskID = task.id;

      if ( node.type === FLOGO_NODE_TYPE.NODE_ADD ) {
        node.type = FLOGO_NODE_TYPE.NODE;
        this._appendAddNode( this.nodes, < FlogoNode > node );
      }
    } else {
      // use Promise.reject with error message cause TypeScript error
      // TODO
      //   change to Promise.reject sometime somehow.
      console.warn( 'Cannot find the node' );
    }

    return Promise.resolve( this );
  }

  public findNodesByType( type: FLOGO_NODE_TYPE, sourceNodes ? : IFlogoNode[ ] ): IFlogoNode[ ] {
    let nodes: IFlogoNode[ ] = [ ];

    if ( sourceNodes ) {
      _.each( sourceNodes, ( node ) => {
        if ( node.type === type ) {
          nodes.push( node );
        }
      } );
    } else {
      _.mapKeys( this.nodes, ( node, key ) => {
        if ( node.type === type ) {
          nodes.push( node );
        }
      } );
    }

    return nodes;
  }

  public findNodesByIDs( ids: string[ ] ): IFlogoNode[ ] {
    let nodes: IFlogoNode[ ] = [ ];

    _.each( ids, ( id ) => {
      let node = this.nodes[ id ];

      node && nodes.push( node );
    } );

    return nodes;
  }

  public findChildrenNodesByType( type: FLOGO_NODE_TYPE, node: IFlogoNode ): IFlogoNode[ ] {
    return this.findNodesByType( type, this.findNodesByIDs( node.children ) );
  }

  public findParentsNodesByType( type: FLOGO_NODE_TYPE, node: IFlogoNode ): IFlogoNode[ ] {
    return this.findNodesByType( type, this.findNodesByIDs( node.parents ) );
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
    let diagram = this;
    // enter selection
    tasks.enter( )
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'flogo-flows-detail-diagram-node', true )
      .on( 'click', function ( d: IFlogoNode, col: number, row: number ) {
        console.group( 'on click' );

        console.group( 'node data' );
        // console.table( d );
        console.log( d );
        console.groupEnd( );

        if ( d.taskID ) {
          console.group( 'task data' );
          console.log( diagram.tasks[ d.taskID ] );
          console.groupEnd( );
        }

        console.group( 'location in matrix' );
        console.log( `row: ${row+1}, col: ${col+1}` );
        console.groupEnd( );

        console.group( 'event' );
        console.log( d3.event );

        // trigger specific events
        if ( CustomEvent && this.dispatchEvent ) {
          let evtDetail = {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'cancelBubble': true,
            'detail': {
              origEvent: d3.event,
              node: d,
              col: col,
              row: row
            }
          }

          let evtType = '';

          if ( d.type === FLOGO_NODE_TYPE.NODE_ADD ) {
            evtType = 'flogoAddTask';

            // TODO
            //   refine the logic to handle more nodes
          } else if ( [ FLOGO_NODE_TYPE.NODE, FLOGO_NODE_TYPE.NODE_ROOT ].indexOf( d.type ) !== -1 ) {
            evtType = 'flogoEditTask';
          }

          if ( evtType ) {
            let evt = new CustomEvent( evtType, evtDetail );

            if ( this.dispatchEvent( evt ) ) {
              console.log( evt );
            }
          }

        } else {
          console.warn( 'Unsupport CustomEvent or dispatchEvent' );
        }

        console.groupEnd( );

        console.groupEnd( );
      } )
      // .style( 'opacity', 1e-6 )
      // .style( 'border-color', '#ff5500' )
      // .transition( )
      // .duration( 350 )
      // .style( 'opacity', 1 )

    // update selection
    tasks.classed( 'updated', true )
      .attr( 'data-flogo-node-type', ( d: IFlogoNode ) => FLOGO_NODE_TYPE[ d.type ].toLowerCase( ) )
      .text( ( d: IFlogoNode ) => {
        let task = this.tasks[ d.taskID ];
        let label = ( task && task.name ) || [ d.id, ' [', d.parents, ' to ', d.children, '] ' ].join( '' );

        if ( d.type === FLOGO_NODE_TYPE.NODE_ADD ) {
          label = 'ADD';
        }

        return label;
      } )
      // .transition( )
      // .duration( 350 )
      // .delay( 350 )
      // .style( 'border-color', '#fff' );

    // exit selection
    tasks.exit( )
      .classed( {
        'updated': false,
        'exit': true
      } )
      .on( 'click', null )
      // .transition( )
      // .duration( 350 )
      // .style( 'opacity', 1e-6 )
      .remove( );
  };

  private _appendAddNode( nodeDict: IFlogoNodeDictionary, node: FlogoNode ) {
    let newAddNode = new FlogoNode( );
    console.log( newAddNode.id );
    nodeDict[ newAddNode.id ] = newAddNode;

    node.linkToChildren( [ newAddNode.id ] );
    newAddNode.linkToParents( [ node.id ] );
  }

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

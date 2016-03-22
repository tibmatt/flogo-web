import { Injectable } from 'angular2/core';

import { FGTaskDictionary, FGDiagram, FGTask, FGNode, FGNodeType, FGNodeLocation } from '../models';

@Injectable( )
export class FGDiagramService {

  /**
   * Add node to a diagram
   */
  addNode( opt: {
    node: FGNode,
    loc ? : {
      children: string[ ],
      parents: string[ ]
    },
    diagram: FGDiagram
  } ): Promise < any > {

    // TODO opt validation
    let node: FGNode = opt.node;
    let diagram = opt.diagram;
    let loc: FGNodeLocation = < FGNodeLocation > _.assign( {
      children: node.children || [ ],
      parents: node.parents || [ ]
    }, opt.loc );

    node = < FGNode > _.assign( {}, node, loc );

    console.log( `Adding node ${node.id} ...` );

    // verify if the node ID exist in the diagram
    if ( diagram.nodes[ node.id ] ) {
      console.warn( `Node ${node.id} exists in the diagram, skip adding..` );
      return Promise.reject( `Node ${node.id} exists in the diagram, skip adding..` );
    }

    // insert the node into diagram
    diagram.nodes[ node.id ] = node;

    // wire the parents
    let indirectParentTypes = [ FGNodeType.LINK, FGNodeType.BRANCH ];
    _.some( node.parents, ( d: string, i: number ) => {
      let parentNode: FGNode = diagram.nodes[ d ];
      if ( indirectParentTypes.indexOf( parentNode.type ) === -1 ) {
        if ( parentNode.children.length ) {
          let detachedChild: string;

          _.some( parentNode.children, ( d: string, i: number ) => {
            if ( indirectParentTypes.indexOf( diagram.nodes[ d ].type ) === -1 ) {
              detachedChild = d;

              parentNode.children.splice( parentNode.children.indexOf( d ), 1 );

              diagram.nodes[ d ].parents.splice( diagram.nodes[ d ].parents.indexOf( parentNode.id ), 1 );

              return true;
            }

            return false;
          } );

          // overwrite the children of the adding node
          // TODO refine the logic
          node.children = [ detachedChild ];

        }

        parentNode.children.unshift( node.id );

        return true;
      }

      return false;
    } );

    // ignore loc.children
    // make sure the given node in the parents of its children
    _.each( node.children, ( d: string, i: number ) => {
      let nodeParents: string[ ] = diagram.nodes[ d ].parents;

      _.each( nodeParents, ( parent: string ) => {

        if ( indirectParentTypes.indexOf( diagram.nodes[ parent ].type ) === -1 ) {
          nodeParents.splice( nodeParents.indexOf( parent ), 1 );
        }

      } );

      nodeParents.unshift( node.id );

    } );



    return Promise.resolve( node );
  }

  /**
   * Verify if a node in the diagram
   */
  isNodeUpdatable( opt: {
    node: FGNode,
    loc ? : {
      children: string[ ],
      parents: string[ ]
    },
    diagram: FGDiagram
  } ): boolean {

    // TODO opt validation
    let node = opt.node;
    let diagram = opt.diagram;
    let loc: FGNodeLocation = < FGNodeLocation > _.assign( {
      children: node.children || [ ],
      parents: node.parents || [ ]
    }, opt.loc );

    let verifyFailHandler = ( msg: string ) => {
      console.warn( msg );
      return false;
    }

    console.log( `Verify node ${node.id} ...` );

    /**
     * Verify location
     *   1. Should be inside the diagram
     */

    // inside the diagram
    if ( _.some( loc.children, ( d: any, i: number ) => {
        return !diagram.nodes[ d ];
      } ) || _.some( loc.parents, ( d: any, i: number ) => {
        return !diagram.nodes[ d ];
      } ) ) {

      return verifyFailHandler( `Invalid location ${JSON.stringify(loc)} in diagram, skip updating..` );
    }

    /**
     * Verify the given node
     */

    // verify if the node ID exist in the diagram
    let oldNode = diagram.nodes[ node.id ];
    if ( !oldNode ) {
      return verifyFailHandler( `Node ${node.id} doesn't exists in the diagram, skip updating..` );
    }

    // 1. the old parents contain only one non-branch/non-link node
    // 2. that non-branch/non-link parent of the given node has only this child
    let directParentTotal = 0;
    let indirectParentTypes = [ FGNodeType.LINK, FGNodeType.BRANCH ];
    if ( _.some( oldNode.parents, ( d: any, i: number ) => {

        if ( directParentTotal > 1 ) {
          return true;
        }

        // handle direct parent
        if ( indirectParentTypes.indexOf( diagram.nodes[ d ].type ) !== -1 ) {
          let directParentChildren = diagram.nodes[ d ].children;

          return directParentChildren.length !== 1 || directParentChildren.indexOf( oldNode.id ) === -1;
        } else {
          directParentTotal++;
        }

        return false;
      } ) ) {

      if ( directParentTotal > 1 ) {
        return verifyFailHandler( `Node ${JSON.stringify(oldNode)} has more than one non-branch/non-link parents ${JSON.stringify(oldNode.parents)}, skip updating..` );
      } else {
        return verifyFailHandler( `Node ${JSON.stringify(oldNode)} isn't the only node of its old parent ${JSON.stringify(oldNode.parents)}, skip updating..` );
      }
    }

    /**
     * Verify parents & children
     *   1. has one and only one parent
     *   2. if has child [injection]
     *     1. has one and only one child
     *     2. the given node should have no child
     *     3. the child should be the child of the parent
     *     4. the child should be a non-branch node
     *   3. if has no child
     *     1. if the given node has children [append only]
     *       1. the parent should have no child
     *     2. if the given node has no child
     *       1. if the parent has no child [append] [pass]
     *       2. if the parent has child [injection verification]
     *         1. has one and only one child [skip]
     *         2. the given node should have no child [verified]
     *         3. the child should be the child of the parent [verified]
     *         4. the child should be a non-branch node
     */

    // single parent in the new location
    if ( loc.parents.length !== 1 ) {
      return verifyFailHandler( `Invalid parents ${JSON.stringify(loc.parents)}` );
    }

    let newParent = diagram.nodes[ loc.parents[ 0 ] ];

    if ( loc.children.length ) {
      // has one and only one child
      if ( loc.children.length !== 1 ) {
        return verifyFailHandler( `There should only be one child when injecting node into a path.` );
      }

      let newLocChild = diagram.nodes[ loc.children[ 0 ] ];

      // the given node should have no child
      if ( oldNode.children.length ) {
        return verifyFailHandler( `There should only be no child in the given node when injecting it into a path.` );
      }

      // the children should be a non-branch node
      if ( newLocChild.type === FGNodeType.BRANCH ) {
        return verifyFailHandler( `The new child should not be a branch node when injecting a node into a path.` );
      }

      // the children should be the child of the new parent
      if ( newParent.children.indexOf( newLocChild.id ) === -1 ) {
        return verifyFailHandler( `The new child should be the children of the new parent when injecting a node into a path.` );
      }
    } else {
      if ( oldNode.children.length ) {
        if ( newParent.children.length ) {
          return verifyFailHandler( `The given parent should have no child when append node to it.` );
        }
      } else {
        if ( newParent.children.length ) {
          // injection verification
          let newParentChild = diagram.nodes[ newParent.children[ 0 ] ];

          // the children should be a non-branch node
          if ( newParentChild.type === FGNodeType.BRANCH ) {
            return verifyFailHandler( `The new child should not be a branch node when injecting a node into a path.` );
          }
        }
      }
    }

    return true;
  }


  /**
   * Update node in the diagram
   */
  updateNode( opt: {
    node: FGNode,
    loc ? : {
      children: string[ ],
      parents: string[ ]
    },
    diagram: FGDiagram
  } ): Promise < any > {

    // TODO opt validation
    let node = opt.node;
    let diagram = opt.diagram;
    let loc: FGNodeLocation = < FGNodeLocation > _.assign( {
      children: node.children || [ ],
      parents: node.parents || [ ]
    }, opt.loc );

    let verifyFailHandler = ( msg: string ) => {
      console.warn( msg );
      return Promise.reject( msg );
    }

    console.log( `Updating node ${node.id} ...` );

    /**
     * Cases
     *   1. Update task content
     *     1. don't care, render will do the job
     *   2. Update the task location (non-branch/non-link node)
     *     1. [verification]
     *       1. the old parents contain only one non-branch/non-link node
     *       2. that non-branch/non-link parent of the given node has only this child
     *     2. attach the given node and its descendant to a new parent (only update parents)
     *       1. [verification] in this case, the new parent should have no child
     *       2. unlink the given node from the current non-branch/non-link parents (should be only one).
     *       3. link to the new parent - merge the new parents array with the branch/link parents
     *     3. inject the given node into a path (update both children and parents)
     *       1. [verification] in this case
     *         1. the new parent is the parent of the new child
     *         2. the new child is a non-branch node
     *         3. the given node should have no child
     *       2. break the links to all of the old children,
     *       3. unlink the given node from the current non-branch/non-link parents (should be only one).
     *       4. link to the new parent - merge the new parents array with the branch/link parents
     *       5. link to the new child
     *     4. inject the given node into a path with omit children (only passed parents)
     *       1. [verification] in this case,
     *         1. the new parent should have children
     *         2. the given node should have no child
     *       2. the reset of the operations should be similar to the normal injection
     *   3. [merged with case 2] Update a non-branch/non-link node linked by multiple link/branch nodes
     *     1. unlink the given node from the current non-branch/non-link parents (should be only one).
     *     2. merge the new parents array with the branch/link parents
     *   4. [TODO] Update link node
     *     *. [alternatives]
     *       1. use add node + delete node to handle this case
     *     1. [verification] in this case
     *       1. only the children can be changed, since changing the parent & child is a combination of delete link node and create a new one link the parent and child together
     *       2. should only have single child
     *     2. unlink from the old children
     *     3. link to the new children
     *   5. [TODO] Update branch node
     *     1. children only
     *     2. parent only
     */

    if ( !this.isNodeUpdatable( opt ) ) {
      return verifyFailHandler( 'Cannot update the node..' );
    }

    let oldNode = diagram.nodes[ node.id ];
    let indirectParentTypes = [ FGNodeType.LINK, FGNodeType.BRANCH ];
    let oldParent: any;

    _.some( oldNode.parents, ( d: any, i: number ) => {

      // find the direct parent
      if ( indirectParentTypes.indexOf( diagram.nodes[ d ].type ) === -1 ) {
        oldParent = diagram.nodes[ d ];
        return true;
      }

      return false;
    } );


    let newParent = diagram.nodes[ loc.parents[ 0 ] ];

    let updateMode = 'inject'; // 'inject' or 'append'

    if ( !loc.children.length && ( oldNode.children.length || !newParent.children.length ) ) {
      updateMode = 'append';
    }

    // create the updated node
    node = < FGNode > _.assign( {}, node, loc );

    /**
     * Create the updated node
     *   1. node.children should contain all of the old children plus the new ones in the loc
     *   2. node.parents should contain all of the branch/link nodes plus the new parent
     */
    // handle node.parents
    node.parents = < string[ ] > _.uniq( _.difference( oldNode.parents, [ oldParent.id ] )
      .concat( node.parents ) );

    // handle node.children
    node.children = < string[ ] > _.uniq( oldNode.children.concat( node.children ) );

    let oldParentChildren = oldParent.children;
    if ( updateMode === 'append' ) {
      /**
       * Append to a parent
       *   1. unlink the node from its old parent
       *   2. link the node to its new parent
       */

      // unlink the node from its old parent
      oldParentChildren.splice( oldParentChildren.indexOf( oldNode.id ), 1 );

      // link the node to its new parent
      diagram.nodes[ loc.parents[ 0 ] ].children.push( node.id );

    } else if ( updateMode === 'inject' ) {
      /**
       * Inject to a path
       *   1. unlink the node from its old parent
       *   2. unlink the only non-branch node from its new parent
       *   3. link the non-branch node as the children of the node
       *   4. link the node to the new parent
       */

      // unlink the node from its old parent
      oldParentChildren.splice( oldParentChildren.indexOf( oldNode.id ), 1 );

      // unlink the only non-branch node from its new parent
      let newChild: string;

      _.some( newParent.children, ( d: any, i: number ) => {

        if ( diagram.nodes[ d ].type !== FGNodeType.BRANCH ) {
          newChild = d;
          newParent.children.splice( newParent.children.indexOf( d ), 1 );
          return true;
        }

        return false;
      } );

      // link the non-branch node as the children of the node
      // node.children.push( newChild ); // constructing `node` did the job
      let newChildParents = diagram.nodes[ newChild ].parents;
      newChildParents.splice( newChildParents.indexOf( newParent.id ), 1 );
      newChildParents.push( node.id );

      // link the node to the new parent
      // node.parents.push( newParent.id ); // constructing `node` did the job
      newParent.children.unshift( node.id ); // always make the non-branch node as the first node
    }

    // update node in diagram
    diagram.nodes[ node.id ] = node;

    return Promise.resolve( node );
  }

  /**
   * Transform the given diagram to the matrix for displaying
   */
  transformDiagram( diagram: FGDiagram ): string[ ][ ] {
    let _matrix = [
      [ "1", "2", "3", "4" ],
      [ "b1", "5", "6" ],
      [ "b5", "7" ],
      [ "b2", "8", "9", "a", "b" ],
      [ "b3", "c", "d", "l1" ],
      [ "b4", "e", "l2" ]
    ];

    let matrix: string[ ][ ] = [ ];

    // find the root node
    let root: FGNode; // diagram node
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
    console.log( _matrix );
    console.log( matrix );
    console.log( 'isEqual: ', _.isEqual( _matrix, matrix ) );
    console.groupEnd( );

    return matrix;
  }

  getValidParents( opt: {
    node: FGNode,
    diagram: FGDiagram
  } ) {

    let validParents: string[ ] = [ ];
    let indirectParentTypes = [ FGNodeType.LINK, FGNodeType.BRANCH ];

    let isNodeInDiagram = !!opt.diagram.nodes[ opt.node.id ];

    if ( isNodeInDiagram ) {
      _.forIn( opt.diagram.nodes, ( node: FGNode, nodeID: string ) => {
        if ( indirectParentTypes.indexOf( opt.diagram.nodes[ nodeID ].type ) === -1 && nodeID !== opt.node.id ) {
          if ( this.isNodeUpdatable( {
              node: opt.diagram.nodes[ opt.node.id ],
              loc: {
                parents: [ nodeID ],
                children: [ ]
              },
              diagram: opt.diagram
            } ) ) {
            validParents.push( nodeID );
          }
        }
      } );
    } else {
      _.forIn( opt.diagram.nodes, ( node: FGNode, nodeID: string ) => {
        if ( indirectParentTypes.indexOf( opt.diagram.nodes[ nodeID ].type ) === -1 ) {
          validParents.push( nodeID );
        }
      } );
    }


    return validParents;
  }

  getValidChildren( opt: {
    node: FGNode,
    diagram: FGDiagram
  } ) {

    let validChildren: string[ ] = [ ];
    let indirectParentTypes = [ FGNodeType.LINK, FGNodeType.BRANCH ];

    let isNodeInDiagram = !!opt.diagram.nodes[ opt.node.id ];

    if ( isNodeInDiagram ) {
      _.forIn( opt.diagram.nodes, ( node: FGNode, nodeID: string ) => {
        if ( indirectParentTypes.indexOf( opt.diagram.nodes[ nodeID ].type ) === -1 && nodeID !== opt.node.id ) {

          if ( this.isNodeUpdatable( {
              node: opt.diagram.nodes[ nodeID ],
              loc: {
                parents: [ opt.node.id ],
                children: [ ]
              },
              diagram: opt.diagram
            } ) ) {
            validChildren.push( nodeID );
          }
        }
      } );
    } else {
      _.forIn( opt.diagram.nodes, ( node: FGNode, nodeID: string ) => {
        if ( indirectParentTypes.indexOf( opt.diagram.nodes[ nodeID ].type ) === -1 ) {
          validChildren.push( nodeID );
        }
      } );
    }

    return validChildren;
  }

}


// helper function of transformMatrix function
//   if the item has multiple children, put the first non-branch node along with the item
//   create new row the the rest of the branch nodes
function _insertChildNodes( matrix: string[ ][ ], diagram: FGDiagram, node: FGNode ): string[ ][ ] {

  // deep-first traversal

  let curRowIdx = matrix.length - 1;

  if ( node.children.length ) {
    _.each( node.children, ( d: string, i: number ) => {
      if ( diagram.nodes[ d ].type !== FGNodeType.BRANCH ) {
        // push to the current row if it's non-branch node
        matrix[ curRowIdx ].push( d );
      } else {
        // create new row for branch node
        matrix.push( [ d ] );
      }

      // not follow the children of a link node
      if ( diagram.nodes[ d ].type !== FGNodeType.LINK ) {
        _insertChildNodes( matrix, diagram, diagram.nodes[ d ] );
      }

    } );
  }

  return matrix;
}

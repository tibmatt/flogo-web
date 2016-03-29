import { IFlogoFlowDiagram } from '../models';

export enum FLOGO_NODE_TYPE {
  NODE_ADD,
  NODE_ROOT,
  NODE_ROOT_NEW,
  NODE,
  NODE_BRANCH,
  NODE_LINK,
  NODE_SUB_PROC,
  NODE_LOOP
}

export interface IFlogoFlowDiagramNode {
  id : string; // id of the node
  taskID : string; // id of the task
  type : FLOGO_NODE_TYPE; // type of the node
  children : string[ ]; // ids of the children IFlogoFlowDiagramNode
  parents : string[ ]; // ids of the parents IFlogoFlowDiagramNode
  subProc ? : IFlogoFlowDiagram[ ]; // [optional] sub process diagram of a task with sub process
}

export interface IFlogoFlowDiagramNodeLocation {
  children : string[ ]; // ids of the children IFlogoFlowDiagramNode
  parents : string[ ]; // ids of the parents IFlogoFlowDiagramNode
}

export interface IFlogoFlowDiagramRootNode {
  is : string; // marking the root node in this dictionary
}

export class FlogoFlowDiagramNode implements IFlogoFlowDiagramNode {
  id : string; // id of the node
  taskID : string; // id of the task
  type : FLOGO_NODE_TYPE; // type of the node
  children : string[ ]; // ids of the children IFlogoFlowDiagramNode
  parents : string[ ]; // ids of the parents IFlogoFlowDiagramNode
  subProc : IFlogoFlowDiagram[ ]; // [optional] sub process diagram of a task with sub process

  constructor( node ? : IFlogoFlowDiagramNode ) {
    if ( !node ) {
      node = {
        id : FlogoFlowDiagramNode.genNodeID(),
        taskID : '',
        type : FLOGO_NODE_TYPE.NODE_ADD,
        children : [],
        parents : []
      }
    }

    this.update( node );
  };

  static genNodeID() : string {
    return btoa( 'FlogoFlowDiagramNode::' + Date.now() );
  };

  public update( node : IFlogoFlowDiagramNode ) : Promise < FlogoFlowDiagramNode > {

    this.id = node.id;
    this.taskID = node.taskID;
    this.type = node.type;
    this.children = _.cloneDeep( node.children );
    this.parents = _.cloneDeep( node.parents );
    this.subProc = _.cloneDeep( node.subProc );

    return Promise.resolve( this );
  };

  public hasNoChild() {
    return !this.children.length;
  };

  public hasNoParent() {
    return !this.parents.length;
  };

  public linkTo(
    nodes : {
      parents ? : string[ ],
      children ? : string[ ]
    }
  ) : Promise < boolean[ ] > {
    let promises : Promise < boolean > [ ] = [];

    if ( nodes.children ) {
      promises.push( this.linkToChildren( nodes.children ) );
    }

    if ( nodes.parents ) {
      promises.push( this.linkToParents( nodes.parents ) );
    }

    return Promise.all( promises );
  };

  public linkToChildren( nodeIDs : string[ ] ) : Promise < boolean > {
    this.children = _.union( this.children, nodeIDs );

    console.groupCollapsed( this.id + ' linkToChildren' );
    console.log( this );
    console.log( this.children );
    console.groupEnd();

    return Promise.resolve( true );
  };

  public linkToParents( nodeIDs : string[ ] ) : Promise < boolean > {
    this.parents = _.union( this.parents, nodeIDs );

    console.groupCollapsed( this.id + ' linkToParents' );
    console.log( this );
    console.log( this.parents );
    console.groupEnd();

    return Promise.resolve( true );
  };

  public unlinkFrom(
    nodes : {
      parents ? : string[ ],
      children ? : string[ ]
    }
  ) : Promise < boolean[ ] > {
    let promises : Promise < boolean > [ ] = [];

    if ( nodes.children ) {
      promises.push( this.unlinkFromChildren( nodes.children ) );
    }

    if ( nodes.parents ) {
      promises.push( this.unlinkFromParents( nodes.parents ) );
    }

    return Promise.all( promises );
  };

  public unlinkFromChildren( nodeIDs : string[ ] ) : Promise < boolean > {
    let removed = _.remove(
      this.children, ( nodeID ) => {
        return nodeIDs.indexOf( nodeID ) !== -1;
      }
    );

    console.groupCollapsed( this.id + ' unlinkFromChildren' );
    console.log( this );
    console.log( removed );
    console.groupEnd();

    return Promise.resolve( true );
  };

  public unlinkFromParents( nodeIDs : string[ ] ) : Promise < boolean > {
    let removed = _.remove(
      this.parents, ( nodeID ) => {
        return nodeIDs.indexOf( nodeID ) !== -1;
      }
    );

    console.groupCollapsed( this.id + ' unlinkFromParents' );
    console.log( this );
    console.log( removed );
    console.groupEnd();

    return Promise.resolve( true );
  };

}

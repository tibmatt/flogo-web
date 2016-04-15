import {
  IFlogoFlowDiagramRootNode,
  IFlogoFlowDiagramNodeDictionary,
  IFlogoFlowDiagramTaskDictionary,
  IFlogoFlowDiagramNode,
  FlogoFlowDiagramNode,
  IFlogoFlowDiagramTask,
  FlogoFlowDiagramProcess
} from '../models';
import { Selection } from 'd3';
import { FLOGO_FLOW_DIAGRAM_NODE_TYPE, FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE } from '../constants';
import { FLOGO_TASK_STATUS } from '../../../common/constants';

export interface IFlogoFlowDiagram {
  root : IFlogoFlowDiagramRootNode;
  nodes : IFlogoFlowDiagramNodeDictionary;
  MAX_ROW_LEN? : number;
}

const DEFAULT_MAX_ROW_LEN = 7;

export class FlogoFlowDiagram implements IFlogoFlowDiagram {
  public root : IFlogoFlowDiagramRootNode;
  public nodes : IFlogoFlowDiagramNodeDictionary;
  public MAX_ROW_LEN = DEFAULT_MAX_ROW_LEN;

  private rootElm : Selection < any >;
  private ng2StyleAttr = '';

  constructor(
    diagram : IFlogoFlowDiagram, private tasks : IFlogoFlowDiagramTaskDictionary, private elm ? : HTMLElement
  ) {
    this.updateDiagram( diagram );
  }

  static transformDiagram( diagram : IFlogoFlowDiagram ) : string[ ][ ] {
    let matrix : string[ ][ ] = [];

    // find the root node
    let root : IFlogoFlowDiagramNode; // diagram node
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
    console.groupEnd();

    return matrix;
  }

  static padMatrix( matrix : string [][], rowLen = DEFAULT_MAX_ROW_LEN ) : string[][] {
    let outputMatrix : string[][] = [];

    _.each(
      matrix, ( matrixRow ) => {
        if ( matrixRow.length < rowLen ) {
          let rowLenDiff = rowLen - matrixRow.length;
          let paddingArr = _.fill( Array( rowLenDiff ), '_' );
          outputMatrix.push( matrixRow.concat( paddingArr ) );
        } else {
          // TODO
          // ignore for the moment, assuming that the row won't be overflow
          // and the overflow case should be handled somewhere else.

          outputMatrix.push( matrixRow )
        }
      }
    );

    return outputMatrix;
  }

  static getEmptyDiagram() : IFlogoFlowDiagram {
    let newRootNode = new FlogoFlowDiagramNode();
    let empytDiagram = < IFlogoFlowDiagram > {
      root : {
        is : newRootNode.id
      },
      nodes : < IFlogoFlowDiagramNodeDictionary > {}
    };

    newRootNode.type = FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW;

    empytDiagram.nodes[ newRootNode.id ] = newRootNode;

    return empytDiagram;
  }

  static filterOverflowAddNode(
    matrix : string[][], nodes : IFlogoFlowDiagramNodeDictionary, rowLen = DEFAULT_MAX_ROW_LEN
  ) : string[][] {
    let outputMatrix = _.cloneDeep( matrix );

    _.each(
      outputMatrix, ( matrixRow : string[] ) => {

        if ( matrixRow.length > rowLen ) {

          let diffRowLen = matrixRow.length - rowLen;
          let node : IFlogoFlowDiagramNode;

          while ( diffRowLen ) {
            let node = nodes[ matrixRow[ matrixRow.length - 1 ] ];

            if ( node && (
                node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD ||
                node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW
              ) ) {
              matrixRow.pop();
            }

            diffRowLen--;
          }

        }

      }
    );


    return outputMatrix;
  }

  public update(
    opt : {
      diagram ? : IFlogoFlowDiagram;
      tasks ? : IFlogoFlowDiagramTaskDictionary;
      element ? : HTMLElement;
    }
  ) : Promise < FlogoFlowDiagram > {
    let promises : Promise < FlogoFlowDiagram > [ ] = [];

    if ( opt.diagram ) {
      promises.push( this.updateDiagram( opt.diagram ) );
    }

    if ( opt.tasks ) {
      promises.push( this.updateTasks( opt.tasks ) );
    }

    if ( opt.element ) {
      promises.push( this.updateElement( opt.element ) );
    }

    return Promise.all( promises )
      .then( () => this );
  }

  public updateAndRender(
    opt : {
      diagram ? : IFlogoFlowDiagram;
      tasks ? : IFlogoFlowDiagramTaskDictionary;
      element ? : HTMLElement;
    }
  ) : Promise < FlogoFlowDiagram > {
    return this.update( opt )
      .then(
        () => {
          return this.render();
        }
      );
  }

  public updateDiagram( diagram : IFlogoFlowDiagram ) : Promise < FlogoFlowDiagram > {
    if ( _.isEmpty( diagram ) || _.isEmpty( diagram.root ) ) {

      // handle empty diagram
      this.updateDiagram( FlogoFlowDiagram.getEmptyDiagram() );

    } else {

      // handle diagram with trigger and more nodes

      // keep a copy of diagram information, but only keep the reference of the tasks
      this.root = _.cloneDeep( diagram.root );

      // convert FlogoNode object into instance of FlogoNode class
      //   TODO optimisation is required
      // if a node has no child, append a NODE_ADD node as its child
      //   TODO case of NODE_LINK should be considered differently
      let nodeDict : IFlogoFlowDiagramNodeDictionary = {};
      let NODES_CAN_HAVE_ADD_NODE = [
        FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
        FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
        FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
        FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_SUB_PROC,
        FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_LOOP
      ];

      _.forIn(
        diagram.nodes, ( node, nodeID ) => {
          let newNode = nodeDict[ nodeID ] = new FlogoFlowDiagramNode( node );

          if ( newNode.hasNoChild() && NODES_CAN_HAVE_ADD_NODE.indexOf( newNode.type ) !== -1 ) {
            this._appendAddNode( nodeDict, < FlogoFlowDiagramNode > newNode );
          }

        }
      );

      this.nodes = nodeDict;

      this.MAX_ROW_LEN = _.isNumber( diagram.MAX_ROW_LEN ) ? diagram.MAX_ROW_LEN : this.MAX_ROW_LEN;
    }


    return Promise.resolve( this );
  }

  public updateTasks( tasks : IFlogoFlowDiagramTaskDictionary ) : Promise < FlogoFlowDiagram > {
    this.tasks = tasks;
    return Promise.resolve( this );
  }

  public updateElement( elm : HTMLElement ) : Promise < FlogoFlowDiagram > {
    d3.select( this.elm )
      .select( '.flogo-flows-detail-diagram' )
      .selectAll( '.flogo-flows-detail-diagram-row' )
      .remove(); // clean the previous diagram
    this.elm = elm;
    return Promise.resolve( this );
  }

  private _bindDataToRows( rows : any ) {
    return rows.data(
      FlogoFlowDiagram.filterOverflowAddNode(
        FlogoFlowDiagram.padMatrix(
          FlogoFlowDiagram.transformDiagram( this ), this.MAX_ROW_LEN
        ), this.nodes
      )
    );
  }

  private _handleEnterRows( rows : any ) {
    let enterRows = rows
      .enter()
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'flogo-flows-detail-diagram-row', true )
      .on(
        'mouseenter', function () {
          d3.select( this )
            .classed( 'hover', true );
        }
      )
      .on(
        'mouseleave', function () {
          d3.select( this )
            .classed( 'hover', false );
        }
      );
  }

  private _handleUpdateRows( rows : any ) {
    rows.classed( 'updated', true );

    let tasks = this._bindDataToNodes( rows.selectAll( '.flogo-flows-detail-diagram-node' ) );

    this._handleTaskNodes( tasks );
  }

  private _handleExitRows( rows : any ) {
    rows.exit()
      .classed(
        {
          'updated' : false,
          'exit' : true
        }
      )
      .on( 'mouseenter', null )
      .on( 'mouseleave', null )
      .remove();
  }

  private _bindDataToNodes( nodes : any ) {
    return nodes.data(
      ( d : IFlogoFlowDiagramNode[ ] ) => {
        return _.map(
          d, ( nodeID : string ) => {
            let nodeInfo = this.nodes[ nodeID ];

            if ( nodeID === '_' ) {
              // placeholder node
              nodeInfo = {
                id : '',
                taskID : '',
                type : FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER,
                children : [],
                parents : []
              };
            } else if ( _.isEmpty( nodeInfo ) ) {
              console.warn( 'Empty Node Information' );
              // TODO
              //  add some handler
            }

            return nodeInfo;
          }
        );
      }
    );
  }

  private _handleEnterNodes( nodes : any ) {
    let diagram = this;
    let timerHandle : any = {};

    // enter selection
    let newNodes = nodes.enter()
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'flogo-flows-detail-diagram-node', true )
      .on(
        'click', function ( d : IFlogoFlowDiagramNode, col : number, row : number ) {
          console.group( 'on click' );

          console.group( 'node data' );
          // console.table( d );
          console.log( d );
          console.groupEnd();

          if ( d.taskID ) {
            console.group( 'task data' );
            console.log( diagram.tasks[ d.taskID ] );
            console.groupEnd();
          }

          console.group( 'location in matrix' );
          console.log( `row: ${row + 1}, col: ${col + 1}` );
          console.groupEnd();

          console.group( 'event' );
          console.log( d3.event );
          console.groupEnd();

          if ( !(
              d.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER
            ) ) {

            let evtType = '';

            if ( d.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD ||
                 d.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW ) {
              evtType = 'flogoAddTask';

              // TODO
              //   refine the logic to handle more kinds of nodes
            } else if ( [
                          FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
                          FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT
                        ].indexOf( d.type ) !== -1 ) {
              evtType = 'flogoSelectTask';
            }

            if ( evtType ) {

              _triggerCustomEvent(
                evtType, {
                  origEvent : d3.event,
                  node : d,
                  col : col,
                  row : row
                }, this
              );

            }

            d3.select( this )
              .classed( 'flogo-flows-detail-diagram-node-selected', true );
          }

          console.groupEnd();
        }
      )
      .on(
        'mouseenter', function ( d : IFlogoFlowDiagramNode ) {
          let element : HTMLElement = this;

          timerHandle[ d.id ] = setTimeout(
            () => {
              d3.select( element )
                .classed( 'flogo-flows-detail-diagram-node-menu-open', true );
            }, 250
          );
        }
      )
      .on(
        'mouseleave', function ( d : IFlogoFlowDiagramNode ) {
          clearTimeout( timerHandle[ d.id ] );
          d3.select( this )
            .classed(
              {
                'flogo-flows-detail-diagram-node-menu-open' : false,
                'flogo-flows-detail-diagram-node-menu-selected' : false
              }
            );
        }
      )
      .on(
        'flogoClickNodeMenu', function ( nodeInfo : any ) {
          d3.select( this )
            .classed( 'flogo-flows-detail-diagram-node-menu-selected', true );
        }
      );
  }

  private _handleUpdateNodes( nodes : any ) {
    let diagram = this;

    nodes.classed(
      {
        'updated' : true,
        'flogo-flows-detail-diagram-node-selected' : false,
        'flogo-flows-detail-diagram-node-menu-open' : false
      }
      )
      .attr(
        'data-flogo-node-type', ( d : IFlogoFlowDiagramNode ) => FLOGO_FLOW_DIAGRAM_NODE_TYPE[ d.type ].toLowerCase()
      );

    nodes.each(
      function ( d : IFlogoFlowDiagramNode ) {
        let thisNode = d3.select( this );
        let task = diagram.tasks && diagram.tasks[ d.taskID ];

        if ( task ) {
          if ( task.status === FLOGO_TASK_STATUS.RUNNING || task.status === FLOGO_TASK_STATUS.DONE ) {
            thisNode.classed( 'flogo-flows-detail-diagram-node-run', true );
          } else {
            thisNode.classed( 'flogo-flows-detail-diagram-node-run', false );
          }
        } else {
          thisNode.classed( 'flogo-flows-detail-diagram-node-run', false );
        }

        thisNode.classed( 'flogo-flows-detail-diagram-node-menu-selected', false );
      }
    );

    let nodeDetails = this._bindDataToNodeDetails( nodes.selectAll( '.flogo-flows-detail-diagram-node-detail' ) );
    this._handleNodeDetails( nodeDetails );

    let nodeBadgeArea = this._bindDataToNodeBadges( nodes.selectAll( '.flogo-flows-detail-diagram-node-badge' ) );
    this._handleNodeBadges( nodeBadgeArea );

    let nodeMenus = this._bindDataToNodeMenus( nodes.selectAll( '.flogo-flows-detail-diagram-node-menu' ) );
    this._handleNodeMenus( nodeMenus );
  }

  private _handleExitNodes( nodes : any ) {
    nodes.exit()
      .classed(
        {
          'updated' : false,
          'exit' : true
        }
      )
      .on( 'click', null )
      .on( 'mouseover', null )
      .on( 'mouseleave', null )
      .on( 'flogoClickNodeMenu', null )
      .remove();
  }

  private _handleTaskNodes( tasks : any ) {

    this._handleEnterNodes( tasks );
    this._handleUpdateNodes( tasks );
    this._handleExitNodes( tasks );

  }

  private _bindDataToNodeDetails( nodeDetails : any ) {
    return nodeDetails.data(
      ( nodeInfo : any )=> {
        if ( nodeInfo ) {
          let task = this.tasks[ nodeInfo.taskID ];

          if ( task && _isNodeHasDetails( nodeInfo ) ) {
            let taskDescription = (
                                    task && (
                                      task.description || `Description of ${task.name}`
                                    )
                                  ) || `[ ${nodeInfo.parents} to ${nodeInfo.children} ]`;

            return [
              {
                name : task.name,
                desc : taskDescription
              }
            ]
          }
        }

        return [ {} ];
      }
    );
  }

  private _handleEnterNodeDetails( nodeDetails : any ) {
    nodeDetails.enter()
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'flogo-flows-detail-diagram-node-detail', true );
  }

  private _handleUpdateNodeDetails( nodeDetails : any ) {
    let diagram = this;

    nodeDetails.html(
      (
        taskInfo : {
          name : string;
          desc : string;
        }
      ) => {

        if ( _.isEmpty( taskInfo ) ) {
          return '';
        }

        return `<img ${diagram.ng2StyleAttr} src="/assets/svg/flogo.flows.detail.diagram.routing.icon.svg" alt=""/>
                <div ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-detail-title">${taskInfo.name}</div>
                <div ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-detail-description">${taskInfo.desc}</div>`;
      }
    );
  }

  private _handleExitNodeDetails( nodeDetails : any ) {
    nodeDetails.exit()
      .remove();
  }

  private _handleNodeDetails( nodeDetails : any ) {

    this._handleEnterNodeDetails( nodeDetails );
    this._handleUpdateNodeDetails( nodeDetails );
    this._handleExitNodeDetails( nodeDetails );

  }

  private _bindDataToNodeMenus( nodeMenus : any ) {
    return nodeMenus.data(
      ( nodeInfo : any )=> {
        if ( nodeInfo && _isNodeHasMenu( nodeInfo ) ) {
          return [ nodeInfo ];
        }

        return [];
      }
    );
  }

  private _handleEnterNodeMenus( nodeMenus : any ) {
    nodeMenus.enter()
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'flogo-flows-detail-diagram-node-menu', true )
      .on(
        'click', function ( nodeInfo : any, col : number, row : number ) {
          let event = <Event>d3.event;
          event.stopPropagation();

          if ( (
              <HTMLElement>event.target
            ).getAttribute( 'data-menu-item-type' ) ) {

            // fire event if it's menu item
            let evtType = 'flogoClickNodeMenuItem';

            _triggerCustomEvent(
              evtType, {
                origEvent : d3.event,
                node : nodeInfo,
                col : col,
                row : row
              }, this
            );
          } else {

            // fire menu on clicked event if this menu is clicked.
            let evtType = 'flogoClickNodeMenu';

            _triggerCustomEvent(
              evtType, {
                origEvent : d3.event,
                node : nodeInfo,
                col : col,
                row : row
              }, this
            );
          }
        }
      );
  }

  private _handleUpdateNodeMenus( nodeMenus : any ) {
    let diagram = this;

    // TODO
    //  enable the delete for trigger in the future
    nodeMenus.html(
      ( nodeInfo : any ) => {
        if ( nodeInfo.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT ) {

          // template without delete
          return `<ul ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-box">
                  <li ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-list" data-menu-item-type="${FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.ADD_BRANCH}"><i class="fa fa-plus"></i>Add branch</li>
                  <li ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-list" data-menu-item-type="${FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.SELECT_TRANSFORM}"><i class="fa fa-bolt"></i>Transform</li>
                </ul>
                <span ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-gear"></span>`;
        }

        // normal template
        return `<ul ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-box">
                  <li ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-list" data-menu-item-type="${FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.ADD_BRANCH}"><i class="fa fa-plus"></i>Add branch</li>
                  <li ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-list" data-menu-item-type="${FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.SELECT_TRANSFORM}"><i class="fa fa-bolt"></i>Transform</li>
                  <li ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-list" data-menu-item-type="${FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.DELETE}"><i class="fa fa-trash-o"></i>Delete</li>
                </ul>
                <span ${diagram.ng2StyleAttr} class="flogo-flows-detail-diagram-node-menu-gear"></span>`;
      }
    )
  }

  private _handleExitNodeMenus( nodeMenus : any ) {
    nodeMenus.exit()
      .on( 'click', null )
      .remove();
  }

  private _handleNodeMenus( nodeMenus : any ) {

    this._handleEnterNodeMenus( nodeMenus );
    this._handleUpdateNodeMenus( nodeMenus );
    this._handleExitNodeMenus( nodeMenus );

  }

  private _bindDataToNodeBadges( nodeBadges : any ) {
    return nodeBadges.data(
      ( nodeInfo : any ) => {
        if ( nodeInfo ) {
          let task = this.tasks[ nodeInfo.taskID ];

          if ( task ) {
            return [
              {
                hasError : false,
                hasMapping : _isTaskHasMapping( task )
              }
            ]
          }
        }

        return [];
      }
    );
  }

  private _handleEnterNodeBadges( nodeBadges : any ) {
    nodeBadges.enter()
      .append( 'div' )
      .attr( this.ng2StyleAttr, '' )
      .classed( 'flogo-flows-detail-diagram-node-badge', true );
  }

  private _handleUpdateNodeBadges( nodeBadges : any ) {
    let diagram = this;

    nodeBadges.html(
      (
        nodeStatus : {
          hasError : boolean;
          hasMapping : boolean;
        }
      ) => {
        let tpl = '';

        if ( nodeStatus ) {
          if ( nodeStatus.hasError ) {
            tpl += `<i ${diagram.ng2StyleAttr} class="fa fa-exclamation"></i>`;
          }

          if ( nodeStatus.hasMapping ) {
            tpl += `<i ${diagram.ng2StyleAttr} class="fa fa-bolt"></i>`;
          }
        }

        return tpl;
      }
    );
  }

  private _handleExitNodeBadges( nodeBadges : any ) {
    nodeBadges.exit()
      .remove();
  }

  private _handleNodeBadges( nodeBadges : any ) {

    this._handleEnterNodeBadges( nodeBadges );
    this._handleUpdateNodeBadges( nodeBadges );
    this._handleExitNodeBadges( nodeBadges );

  }

  public render() : Promise < FlogoFlowDiagram > {
    console.group( 'rendering...' );

    this.rootElm = d3.select( this.elm )
      .select( '.flogo-flows-detail-diagram' );

    !this.ng2StyleAttr && this._updateNG2StyleAttr();

    // enter selection
    let rows = this._bindDataToRows( this.rootElm.selectAll( '.flogo-flows-detail-diagram-row' ) );

    this._handleEnterRows( rows );
    this._handleUpdateRows( rows );
    this._handleExitRows( rows );

    console.groupEnd();

    return Promise.resolve( this );
  }

  public linkNodeWithTask( nodeID : string, task : IFlogoFlowDiagramTask ) : Promise < FlogoFlowDiagram > {
    let node = this.nodes[ nodeID ];

    if ( node ) {
      node.taskID = task.id;

      if ( node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD ) {
        node.type = FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE;
        this._appendAddNode( this.nodes, < FlogoFlowDiagramNode > node );
      } else if ( node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW ) {
        node.type = FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT;
        this._appendAddNode( this.nodes, < FlogoFlowDiagramNode > node );
      }
    } else {
      // use Promise.reject with error message cause TypeScript error
      // TODO
      //   change to Promise.reject sometime somehow.
      console.warn( 'Cannot find the node' );
    }

    return Promise.resolve( this );
  }

  public findNodesByType(
    type : FLOGO_FLOW_DIAGRAM_NODE_TYPE, sourceNodes ? : IFlogoFlowDiagramNode[ ]
  ) : IFlogoFlowDiagramNode[ ] {
    let nodes : IFlogoFlowDiagramNode[ ] = [];

    if ( sourceNodes ) {
      _.each(
        sourceNodes, ( node ) => {
          if ( node.type === type ) {
            nodes.push( node );
          }
        }
      );
    } else {
      _.mapKeys(
        this.nodes, ( node ) => {
          if ( node.type === type ) {
            nodes.push( node );
          }
        }
      );
    }

    return nodes;
  }

  public findNodesByIDs( ids : string[ ] ) : IFlogoFlowDiagramNode[ ] {
    let nodes : IFlogoFlowDiagramNode[ ] = [];

    _.each(
      ids, ( id ) => {
        let node = this.nodes[ id ];

        node && nodes.push( node );
      }
    );

    return nodes;
  }

  public findChildrenNodesByType(
    type : FLOGO_FLOW_DIAGRAM_NODE_TYPE, node : IFlogoFlowDiagramNode
  ) : IFlogoFlowDiagramNode[ ] {
    return this.findNodesByType( type, this.findNodesByIDs( node.children ) );
  }

  public findParentsNodesByType(
    type : FLOGO_FLOW_DIAGRAM_NODE_TYPE, node : IFlogoFlowDiagramNode
  ) : IFlogoFlowDiagramNode[ ] {
    return this.findNodesByType( type, this.findNodesByIDs( node.parents ) );
  }

  public deleteNode( node : IFlogoFlowDiagramNode ) : Promise<any> {
    let deleteNode = <FlogoFlowDiagramNode>this.nodes[ node.id ];

    if ( deleteNode ) {
      return deleteNode.unlinkFromDiagram( this.nodes )
        .then(
          ()=> {
            delete this.nodes[ node.id ];

            return this;
          }
        );
    } else {
      return Promise.reject( `Node ${node.id} doesn't exists.` );
    }
  }

  public toProcess() : any {
    return FlogoFlowDiagramProcess.toProcess(
      {
        root : this.root,
        nodes : this.nodes
      }, this.tasks
    );
  }

  private _updateNG2StyleAttr() {
    let el = this.elm.getElementsByClassName( 'flogo-flows-detail-diagram' );
    let ng2StyleAttrReg = /^_ngcontent\-.*$/g;

    if ( el && el.length ) {
      Array.prototype.some.call(
        el[ 0 ].attributes, ( attr : any ) => {

          if ( ng2StyleAttrReg.test( attr.name ) ) {
            this.ng2StyleAttr = attr.name;

            return true;
          }

          return false;
        }
      );

      return true;
    }

    return false;
  }

  private _appendAddNode( nodeDict : IFlogoFlowDiagramNodeDictionary, node : FlogoFlowDiagramNode ) {
    let newAddNode = new FlogoFlowDiagramNode();
    console.log( newAddNode.id );
    nodeDict[ newAddNode.id ] = newAddNode;

    node.linkToChildren( [ newAddNode.id ] );
    newAddNode.linkToParents( [ node.id ] );
  }

}

// helper function of transformMatrix function
//   if the item has multiple children, put the first non-branch node along with the item
//   create new row the the rest of the branch nodes
// TODO
//   at some time, may need to track which node has been visited
//   for example branch back to other path
//   but for now, may not need to care about it
function _insertChildNodes(
  matrix : string[ ][ ], diagram : IFlogoFlowDiagram, node : IFlogoFlowDiagramNode
) : string[ ][ ] {

  // deep-first traversal

  let curRowIdx = matrix.length - 1;

  if ( node.children.length ) {
    _.each(
      node.children, ( d : string ) => {
        if ( diagram.nodes[ d ].type !== FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH ) {
          // push to the current row if it's non-branch node
          matrix[ curRowIdx ].push( d );
        } else {
          // create new row for branch node
          matrix.push( [ d ] );
        }

        // not follow the children of a link node
        if ( diagram.nodes[ d ].type !== FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_LINK ) {
          _insertChildNodes( matrix, diagram, diagram.nodes[ d ] );
        }

      }
    );
  }

  return matrix;
}

function _triggerCustomEvent( eventType : string, eventDetail : any, elm : HTMLElement ) : boolean {

  // trigger specific events
  if ( CustomEvent && elm.dispatchEvent ) {
    if ( eventType ) {
      let evtDetail = {
        'view' : window,
        'bubbles' : true,
        'cancelable' : true,
        'cancelBubble' : true,
        'detail' : eventDetail
      };

      elm.dispatchEvent( new CustomEvent( eventType, evtDetail ) );

      return true;
    } else {
      console.warn( 'No eventType is given.' );
      return false;
    }
  } else {
    console.warn( 'Unsupport CustomEvent or dispatchEvent' );
    return false;
  }

}

function _isNodeHasDetails( nodeInfo : any ) : boolean {
  if ( nodeInfo.type ) {
    return [
             FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD,
             FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW,
             FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER
           ].indexOf( nodeInfo.type ) === -1;
  } else {
    return false;
  }
}

function _isNodeHasMenu( nodeInfo : any ) : boolean {
  if ( nodeInfo.type ) {
    return [
             FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD,
             FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW,
             FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER
           ].indexOf( nodeInfo.type ) === -1;
  } else {
    return false;
  }
}

function _isTaskHasMapping( taskInfo : any ) : boolean {
  return taskInfo && (
      (
        _.isArray( taskInfo.inputMappings ) && taskInfo.inputMappings.length > 0
      )
      // TODO: re-enable outputMappings verification after its editing is enabled
      // || (
      //  _.isArray( taskInfo.outputMappings ) && taskInfo.outputMappings.length > 0
      // )
    )
}

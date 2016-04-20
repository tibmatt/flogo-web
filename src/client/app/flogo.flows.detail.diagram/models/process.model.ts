import {
  IFlogoFlowDiagramTaskAttribute,
  IFlogoFlowDiagramTaskAttributeMapping,
  IFlogoFlowDiagramTask,
  IFlogoFlowDiagramTaskLink,
  IFlogoFlowDiagram,
  IFlogoFlowDiagramNode,
  IFlogoFlowDiagramNodeDictionary,
  IFlogoFlowDiagramTaskDictionary,
  FlogoFlowDiagramTask,
  FlogoFlowDiagramTaskLink
} from '../models';
import {
  FLOGO_PROCESS_TYPE,
  FLOGO_PROCESS_MODEL,
  FLOGO_TASK_TYPE,
  FLOGO_TASK_ATTRIBUTE_TYPE,
  FLOGO_PROCESS_MODELS,
} from '../../../common/constants';

import { FLOGO_FLOW_DIAGRAM_NODE_TYPE, FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE, FLOGO_FLOW_DIAGRAM_DEBUG as DEBUG } from '../constants';
import { flogoIDEncode, convertTaskID } from '../../../common/utils';

export interface IFlogoFlowDiagramProcess {
  id : string;
  name ? : string;
  description ? : string;
  model : string;
  type : FLOGO_PROCESS_TYPE;
  attributes ? : IFlogoFlowDiagramTaskAttribute[ ];
  inputMappings ? : IFlogoFlowDiagramTaskAttributeMapping[ ];
  rootTask : IFlogoFlowDiagramTask;
}

const BASE_PROCESS = {
  id : '',
  name : '',
  description : '',
  process : {
    model : (
      <any>FLOGO_PROCESS_MODELS
    )[ FLOGO_PROCESS_MODEL[ FLOGO_PROCESS_MODEL.DEFAULT ] ],
    type : FLOGO_PROCESS_TYPE.DEFAULT,
    name : '',
    attributes : < IFlogoFlowDiagramTaskAttribute[ ] > [],
    rootTask : < IFlogoFlowDiagramTask > null
  }
};

export class FlogoFlowDiagramProcess {

  static genProcessID() : string {
    return flogoIDEncode( 'FlogoProcess::' + Date.now() );
  }

  static toProcess( diagram : IFlogoFlowDiagram, tasks : IFlogoFlowDiagramTaskDictionary ) : any {
    // ensure the original diagram & tasks won't be changed
    diagram = _.cloneDeep( diagram );
    tasks = _.cloneDeep( tasks );

    let process : any = _.cloneDeep( BASE_PROCESS );

    process.id = FlogoFlowDiagramProcess.genProcessID();
    process.name = 'Default process';
    process.description = 'This is a default process';

    process.process.name = process.name;

    process.process.attributes = [
      {
        "name" : "petInfo",
        "type" : "string",
        "value" : ""
      }
    ];

    if ( !_.isEmpty( diagram ) && !_.isEmpty( tasks ) ) {
      let nodes = diagram.nodes;
      let rootNode = nodes[ diagram.root.is ];
      let rootTask = process.process.rootTask = new FlogoFlowDiagramTask( tasks[ rootNode.taskID ] );
      (
        <any>rootTask
      )[ 'ouputMappings' ] = rootTask.outputMappings;
      delete rootTask.outputMappings;

      _.assign( rootTask, { id : convertTaskID( rootTask.id ) } ); // convert task ID to integer

      let rootTaskChildren = < IFlogoFlowDiagramTask[ ] > [];
      let links = < IFlogoFlowDiagramTaskLink[ ] > [];

      traversalDiagram( diagram, tasks, rootTaskChildren, links );

      if ( !_.isEmpty( links ) ) {
        process.process.rootTask.links = links;
      }

      if ( !_.isEmpty( rootTaskChildren ) ) {
        process.process.rootTask.tasks = rootTaskChildren;
      }
    }

    return process;
  }
}

// helper function of to process
// Note that the input diagram/node/tasks... are all subject to change.
function traversalDiagram(
  diagram : IFlogoFlowDiagram, tasks : IFlogoFlowDiagramTaskDictionary, tasksDest : IFlogoFlowDiagramTask[ ],
  linksDest : IFlogoFlowDiagramTaskLink[ ]
) : void {

  let visited = < string[ ] > [];
  let nodes = diagram.nodes;
  let rootNode = nodes[ diagram.root.is ];


  _traversalChildren( rootNode, visited, nodes, tasks, tasksDest, linksDest );

}

// helper function of to process
// Note that the input diagram/node/tasks... are all subject to change.
function _traversalChildren(
  node : IFlogoFlowDiagramNode, visitedNodes : string[ ], nodes : IFlogoFlowDiagramNodeDictionary,
  tasks : IFlogoFlowDiagramTaskDictionary,
  tasksDest : any[ ], linksDest : any[ ]
) {

  // haven't visited
  if ( !_.includes( visitedNodes, node.id ) ) {
    visitedNodes.push( node.id );

    let nodesToGo = _.difference( node.children, visitedNodes );

    _.each( nodesToGo, ( nid ) => {

      let childNode = nodes[ nid ];

      // filter the ADD node
      if ( childNode.type
        === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD
        || childNode.type
        === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW ) {
        return;
      }

      // handle branch node differently
      if ( childNode.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH ) {
        let branch = <any>tasks[ childNode.taskID ];

        // single child is found
        //  since branch can has only one direct child, this is the only case to follow
        if ( branch && childNode.children.length === 1 ) {
          DEBUG && console.log( 'Found a branch with activity!' );

          // traversal its children
          _traversalChildren( childNode, visitedNodes, nodes, tasks, tasksDest, linksDest );
        } else {
          DEBUG && console.warn( '- Found a branch!\n- Don\'t care..' );
        }

        return;
      }

      /*
       * add task
       */

      let task = <any>tasks[ childNode.taskID ];

      if ( task ) {
        let attrs = <any>[];

        // convert attributes of tasks
        task.attributes.inputs = _.map( task.attributes.inputs, ( input : any ) => {
          let i = <any>_.cloneDeep( input ); // due to Type check
          i.type = _.get( FLOGO_TASK_ATTRIBUTE_TYPE, input.type, 'string' )
            .toLowerCase();
          attrs.push( i );
          return i;
        } );

        // convert attributes of tasks
        task.attributes.outputs = _.map( task.attributes.outputs, ( output : any ) => {
          let o = <any>_.cloneDeep( output ); // due to Type check
          o.type = _.get( FLOGO_TASK_ATTRIBUTE_TYPE, output.type, 'string' )
            .toLowerCase();
          attrs.push( o );
          return o;
        } );

        task.attributes = attrs;

        if ( !_.isEmpty( task.outputMappings ) ) {
          // convert attributes of tasks
          // mapping outputMappings to ouputMappings
          (
            <any>task
          )[ 'ouputMappings' ] = task.outputMappings;
          delete task.outputMappings;
        }

        // convert attributes of tasks
        _.assign( task, { id : convertTaskID( task.id ) } );

        // delete status information
        delete task.status;

        tasksDest.push( task );
      }

      /*
       * add link
       */

      if ( node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE ) {

        linksDest.push( {
          id : FlogoFlowDiagramTaskLink.genTaskLinkID(),
          from : convertTaskID( node.taskID ),
          to : convertTaskID( childNode.taskID ),
          type : FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.DEFAULT
        } );

      } else if ( node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH && node.parents.length === 1 ) {

        let parentNode = nodes[ node.parents[ 0 ] ];
        let branch = <any>tasks[ node.taskID ];

        // ignore the case that the parent node of the branch node is the trigger
        if (parentNode.type !== FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT) {
          // add a branch link
          linksDest.push( {
            id : FlogoFlowDiagramTaskLink.genTaskLinkID(),
            from : convertTaskID( parentNode.taskID ),
            to : convertTaskID( childNode.taskID ),
            type : FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH,
            value : branch.condition
          } );
        }

      }

      _traversalChildren( childNode, visitedNodes, nodes, tasks, tasksDest, linksDest );

    } );
  }

}

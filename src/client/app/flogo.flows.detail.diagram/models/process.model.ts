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
  FLOGO_ACTIVITY_TYPE,
  FLOGO_TASK_ATTRIBUTE_TYPE,
  FLOGO_PROCESS_MODELS, FLOGO_ACTIVITIES,
} from '../../../common/constants';

import { FLOGO_FLOW_DIAGRAM_NODE_TYPE } from '../constants';

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

  static defaultFlogoProcess = {
    id : '',
    model : 'simple',
    type : FLOGO_PROCESS_TYPE.DEFAULT,
    rootTask : {
      'id' : FlogoFlowDiagramTask.genTaskID(),
      'type' : FLOGO_TASK_TYPE.TASK_ROOT,
      'activityType' : FLOGO_ACTIVITY_TYPE.REST,
      'name' : 'Task',
      'attributes' : {
        'inputs' : [
          {
            'type' : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
            'name' : 'uri',
            'value' : 'http://petstore.swagger.io/v2/pet/{petId}'
          },
          {
            'type' : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
            'name' : 'method',
            'value' : 'GET'
          },
          {
            'type' : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
            'name' : 'petId',
            'value' : ''
          }
        ],
        'outputs' : [
          {
            'type' : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
            'name' : 'result',
            'value' : ''
          }
        ]
      },
      'inputMappings' : [
        {
          'type' : 1,
          'value' : 'petId',
          'mapTo' : 'petId'
        }
      ],
      'outputMappings' : [
        {
          'type' : 1,
          'value' : 'result',
          'mapTo' : 'petInfo'
        }
      ]
    }
  };

  static genProcessID() : string {
    return btoa( 'FlogoProcess::' + Date.now() );
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
      rootTask.activityType = (
        <any>FLOGO_ACTIVITIES
      )[ FLOGO_ACTIVITY_TYPE[ rootTask.activityType ] ];
      (
        <any>rootTask
      )[ 'ouputMappings' ] = rootTask.outputMappings;
      delete rootTask.outputMappings;

      _.assign( rootTask, { id : _convertTaskID( rootTask.id ) } ); // convert task ID to integer

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

    _.each(
      nodesToGo, ( nid ) => {

        let n = nodes[ nid ];

        // filter the ADD node
        if ( n.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD ) {
          return;
        }

        let task = <any>tasks[ n.taskID ];

        if ( task ) {
          let attrs = <any>[];

          // convert attributes of tasks
          task.activityType = (
            <any>FLOGO_ACTIVITIES
          )[ FLOGO_ACTIVITY_TYPE[ task.activityType ] ];

          // convert attributes of tasks
          task.attributes.inputs = _.map(
            task.attributes.inputs, ( input : any ) => {
              let i = <any>_.cloneDeep( input ); // due to Type check
              i.type = FLOGO_TASK_ATTRIBUTE_TYPE[ input.type ].toLowerCase();
              attrs.push( i );
              return i;
            }
          );

          // convert attributes of tasks
          task.attributes.outputs = _.map(
            task.attributes.outputs, ( output : any ) => {
              let o = <any>_.cloneDeep( output ); // due to Type check
              o.type = FLOGO_TASK_ATTRIBUTE_TYPE[ output.type ].toLowerCase();
              attrs.push( o );
              return o;
            }
          );

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
          _.assign( task, { id : _convertTaskID( task.id ) } );

          tasksDest.push( task );
        }

        // TODO
        //   need to filter out or handle branch/link node
        if ( node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE ) {
          linksDest.push(
            {
              id : FlogoFlowDiagramTaskLink.genTaskLinkID(),
              from : _convertTaskID( node.taskID ),
              to : _convertTaskID( n.taskID )
            }
          );
        }

        _traversalChildren( nodes[ nid ], visitedNodes, nodes, tasks, tasksDest, linksDest );

      }
    );

  }

}

/**
 * Convert task ID to integer, which is the currently supported type in engine
 * TODO
 *  taskID should be string in the future, perhaps..
 *
 * @param taskID
 * @returns {number}
 * @private
 */
function _convertTaskID( taskID : string ) {
  let id = '';

  try {
    id = atob( taskID );

    // get the timestamp
    let parsedID = id.split( '::' );

    if ( parsedID.length >= 2 ) {
      id = parsedID[ 1 ];
    }
  } catch ( e ) {
    console.warn( e );
    id = taskID;
  }

  return parseInt( id );
}

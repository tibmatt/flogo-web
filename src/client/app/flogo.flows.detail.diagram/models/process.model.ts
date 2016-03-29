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
  FLOGO_TASK_ATTRIBUTE_TYPE, FLOGO_FLOW_DIAGRAM_NODE_TYPE
} from '../constants';

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
  model : FLOGO_PROCESS_MODEL.DEFAULT,
  type : FLOGO_PROCESS_TYPE.DEFAULT,
  attributes : < IFlogoFlowDiagramTaskAttribute[ ] > [],
  rootTask : < IFlogoFlowDiagramTask > null
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
    let process : any = _.cloneDeep( BASE_PROCESS );

    process.id = FlogoFlowDiagramProcess.genProcessID();
    process.name = 'Default process';
    process.description = 'This is a default process';
    process.attributes = [
      {
        "name" : "petInfo",
        "type" : "string",
        "value" : ""
      }
    ];

    let nodes = diagram.nodes;
    let rootNode = nodes[ diagram.root.is ];
    let rootTask = new FlogoFlowDiagramTask( tasks[ rootNode.taskID ] );

    process.rootTask = rootTask;

    let rootTaskChildren = < IFlogoFlowDiagramTask[ ] > [];
    let links = < IFlogoFlowDiagramTaskLink[ ] > [];

    traversalDiagram( diagram, tasks, rootTaskChildren, links );

    if ( !_.isEmpty( links ) ) {
      process.rootTask.links = links;
    }

    if ( !_.isEmpty( rootTaskChildren ) ) {
      process.rootTask.tasks = rootTaskChildren;
    }

    return process;
  }
}

function traversalDiagram(
  diagram : IFlogoFlowDiagram, tasks : IFlogoFlowDiagramTaskDictionary, tasksDest : IFlogoFlowDiagramTask[ ],
  linksDest : IFlogoFlowDiagramTaskLink[ ]
) : void {

  let visited = < string[ ] > [];
  let nodes = diagram.nodes;
  let rootNode = nodes[ diagram.root.is ];


  _traversalChildren( rootNode, visited, nodes, tasks, tasksDest, linksDest );

}

function _traversalChildren(
  node : IFlogoFlowDiagramNode, visitedNodes : string[ ], nodes : IFlogoFlowDiagramNodeDictionary,
  tasks : IFlogoFlowDiagramTaskDictionary,
  tasksDest : IFlogoFlowDiagramTask[ ], linksDest : IFlogoFlowDiagramTaskLink[ ]
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

        let task = tasks[ n.taskID ];

        if ( task ) {
          tasksDest.push( task );
        }

        // TODO
        //   need to filter out or handle branch/link node
        linksDest.push(
          {
            id : FlogoFlowDiagramTaskLink.genTaskLinkID(),
            from : node.id,
            to : nid
          }
        );

        _traversalChildren( nodes[ nid ], visitedNodes, nodes, tasks, tasksDest, linksDest );

      }
    );

  }

}

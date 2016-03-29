import {
  IFlogoAttribute,
  IFlogoAttributeMapping,
  IFlogoTask,
  IFlogoTaskLink,
  IFlogoDiagram,
  IFlogoNode,
  IFlogoNodeDictionary,
  IFlogoTaskDictionary,
  FlogoTask,
  FlogoTaskLink,
  FLOGO_TASK_TYPE,
  FLOGO_NODE_TYPE,
  FLOGO_ACTIVITY_TYPE,
  FLOGO_ATTRIBUTE_TYPE
} from '../models';

export enum FLOGO_PROCESS_TYPE { DEFAULT }

export enum FLOGO_PROCESS_MODEL { DEFAULT }

export interface IFlogoProcess {
  id : string;
  name ? : string;
  description ? : string;
  model : string;
  type : FLOGO_PROCESS_TYPE;
  attributes ? : IFlogoAttribute[ ];
  inputMappings ? : IFlogoAttributeMapping[ ];
  rootTask : IFlogoTask;
}

const BASE_PROCESS = {
  id : '',
  name : '',
  description : '',
  model : FLOGO_PROCESS_MODEL.DEFAULT,
  type : FLOGO_PROCESS_TYPE.DEFAULT,
  attributes : < IFlogoAttribute[ ] > [],
  rootTask : < IFlogoTask > null
};

export class FlogoProcess {

  static defaultFlogoProcess = {
    id : '',
    model : 'simple',
    type : FLOGO_PROCESS_TYPE.DEFAULT,
    rootTask : {
      'id' : FlogoTask.genTaskID(),
      'type' : FLOGO_TASK_TYPE.TASK_ROOT,
      'activityType' : FLOGO_ACTIVITY_TYPE.REST,
      'name' : 'Task',
      'attributes' : {
        'inputs' : [
          {
            'type' : FLOGO_ATTRIBUTE_TYPE.STRING,
            'name' : 'uri',
            'value' : 'http://petstore.swagger.io/v2/pet/{petId}'
          },
          {
            'type' : FLOGO_ATTRIBUTE_TYPE.STRING,
            'name' : 'method',
            'value' : 'GET'
          },
          {
            'type' : FLOGO_ATTRIBUTE_TYPE.STRING,
            'name' : 'petId',
            'value' : ''
          }
        ],
        'outputs' : [
          {
            'type' : FLOGO_ATTRIBUTE_TYPE.STRING,
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

  static toProcess( diagram : IFlogoDiagram, tasks : IFlogoTaskDictionary ) : any {
    let process : any = _.cloneDeep( BASE_PROCESS );

    process.id = FlogoProcess.genProcessID();
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
    let rootTask = new FlogoTask( tasks[ rootNode.taskID ] );

    process.rootTask = rootTask;

    let rootTaskChildren = < IFlogoTask[ ] > [];
    let links = < IFlogoTaskLink[ ] > [];

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
  diagram : IFlogoDiagram, tasks : IFlogoTaskDictionary, tasksDest : IFlogoTask[ ], linksDest : IFlogoTaskLink[ ]
) : void {

  let visited = < string[ ] > [];
  let nodes = diagram.nodes;
  let rootNode = nodes[ diagram.root.is ];


  _traversalChildren( rootNode, visited, nodes, tasks, tasksDest, linksDest );

}

function _traversalChildren(
  node : IFlogoNode, visitedNodes : string[ ], nodes : IFlogoNodeDictionary, tasks : IFlogoTaskDictionary,
  tasksDest : IFlogoTask[ ], linksDest : IFlogoTaskLink[ ]
) {

  // haven't visited
  if ( !_.includes( visitedNodes, node.id ) ) {
    visitedNodes.push( node.id );

    let nodesToGo = _.difference( node.children, visitedNodes );

    _.each(
      nodesToGo, ( nid ) => {

        let n = nodes[ nid ];

        // filter the ADD node
        if ( n.type === FLOGO_NODE_TYPE.NODE_ADD ) {
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
            id : FlogoTaskLink.genTaskLinkID(),
            from : node.id,
            to : nid
          }
        );

        _traversalChildren( nodes[ nid ], visitedNodes, nodes, tasks, tasksDest, linksDest );

      }
    );

  }

}

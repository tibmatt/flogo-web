import {
  IFlogoAttribute,
  IFlogoAttributeMapping,
  IFlogoTaskLink,
  IFlogoAttributes
} from '../models';

export enum FLOGO_ACTIVITY_TYPE {
  DEFAULT,
  LOG,
  REST
};

export const FLOGO_ACTIVITIES = {
  'DEFAULT': '',
  'LOG': 'tibco-log',
  'REST': 'tibco-rest'
};

export enum FLOGO_TASK_TYPE {
  TASK_ROOT,
  TASK,
  TASK_BRANCH,
  TASK_SUB_PROC,
  TASK_LOOP
};


export interface IFlogoTask {
  id: string;
  type: FLOGO_TASK_TYPE;
  version ? : string;
  name ? : string;
  description ? : string;
  title ? : string;
  activityType ? : FLOGO_ACTIVITY_TYPE;
  attributes ? : IFlogoAttributes;
  inputMappings ? : IFlogoAttributeMapping[ ];
  outputMappings ? : IFlogoAttributeMapping[ ];
  tasks ? : IFlogoTask[ ];
  links ? : IFlogoTaskLink[ ];
};

export class FlogoTask implements IFlogoTask {
  id: string;
  type: FLOGO_TASK_TYPE;
  version: string;
  name: string;
  description: string;
  title: string;
  activityType: FLOGO_ACTIVITY_TYPE;
  attributes: IFlogoAttributes;
  inputMappings: IFlogoAttributeMapping[ ];
  outputMappings: IFlogoAttributeMapping[ ];
  tasks: IFlogoTask[ ];
  links: IFlogoTaskLink[ ];

  constructor( task ? : IFlogoTask ) {
    this.update( task );
  }

  update( task: IFlogoTask ) {
    if ( !task ) {
      task = < IFlogoTask > {};
    }

    this.id = task.id || this.id || btoa( 'FlogoTask::' + Date.now( ) );
    this.type = task.type || this.type || FLOGO_TASK_TYPE.TASK;
    this.version = task.version || this.version || '';
    this.name = task.name || this.name || '';
    this.description = task.description || this.description || '';
    this.title = task.title || this.title || '';
    this.activityType = task.activityType || this.activityType || FLOGO_ACTIVITY_TYPE.DEFAULT;
    this.attributes = _.isEmpty( task.attributes ) ? this.attributes || < IFlogoAttributes > {} : _.cloneDeep( task.attributes );
    this.inputMappings = _.isEmpty( task.inputMappings ) ? this.inputMappings || [ ] : _.cloneDeep( task.inputMappings );
    this.outputMappings = _.isEmpty( task.outputMappings ) ? this.outputMappings || [ ] : _.cloneDeep( task.outputMappings );

    if ( !_.isEmpty( task.tasks ) ) {
      this.tasks = _.cloneDeep( task.tasks );
    }

    if ( !_.isEmpty( task.links ) ) {
      this.links = _.cloneDeep( task.links );
    }

  }
}

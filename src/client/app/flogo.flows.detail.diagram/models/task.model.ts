import {
  IFlogoFlowDiagramTaskAttributeMapping,
  IFlogoFlowDiagramTaskLink,
  IFlogoFlowDiagramTaskAttributes
} from '../models';
import { FLOGO_TASK_TYPE, FLOGO_ACTIVITY_TYPE } from '../constants';

export interface IFlogoFlowDiagramTask {
  id : string;
  type : FLOGO_TASK_TYPE;
  version ? : string;
  name ? : string;
  description ? : string;
  title ? : string;
  activityType ? : FLOGO_ACTIVITY_TYPE;
  attributes ? : IFlogoFlowDiagramTaskAttributes;
  inputMappings ? : IFlogoFlowDiagramTaskAttributeMapping[ ];
  outputMappings ? : IFlogoFlowDiagramTaskAttributeMapping[ ];
  tasks ? : IFlogoFlowDiagramTask[ ];
  links ? : IFlogoFlowDiagramTaskLink[ ];
}

export class FlogoFlowDiagramTask implements IFlogoFlowDiagramTask {
  id : string;
  type : FLOGO_TASK_TYPE;
  version : string;
  name : string;
  description : string;
  title : string;
  activityType : FLOGO_ACTIVITY_TYPE;
  attributes : IFlogoFlowDiagramTaskAttributes;
  inputMappings : IFlogoFlowDiagramTaskAttributeMapping[ ];
  outputMappings : IFlogoFlowDiagramTaskAttributeMapping[ ];
  tasks : IFlogoFlowDiagramTask[ ];
  links : IFlogoFlowDiagramTaskLink[ ];

  constructor( task ? : IFlogoFlowDiagramTask ) {
    this.update( task );
  };

  static genTaskID() : string {
    return btoa( 'FlogoFlowDiagramTask::' + Date.now() );
  };

  update( task : IFlogoFlowDiagramTask ) {
    if ( !task ) {
      task = < IFlogoFlowDiagramTask > {};
    }

    this.id = task.id || this.id || FlogoFlowDiagramTask.genTaskID();
    this.type = task.type || this.type || FLOGO_TASK_TYPE.TASK;
    this.version = task.version || this.version || '';
    this.name = task.name || this.name || 'new task';
    this.description = task.description || this.description || '';
    this.title = task.title || this.title || '';
    this.activityType = task.activityType || this.activityType || FLOGO_ACTIVITY_TYPE.DEFAULT;
    this.attributes = _.isEmpty( task.attributes ) ?
                      this.attributes || < IFlogoFlowDiagramTaskAttributes > {} :
                      _.cloneDeep( task.attributes );
    this.inputMappings = _.isEmpty( task.inputMappings ) ? this.inputMappings || [] : _.cloneDeep( task.inputMappings );
    this.outputMappings = _.isEmpty( task.outputMappings ) ?
                          this.outputMappings || [] :
                          _.cloneDeep( task.outputMappings );

    if ( !_.isEmpty( task.tasks ) ) {
      this.tasks = _.cloneDeep( task.tasks );
    }

    if ( !_.isEmpty( task.links ) ) {
      this.links = _.cloneDeep( task.links );
    }

  };
}

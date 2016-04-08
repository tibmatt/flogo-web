import {
  IFlogoFlowDiagramTaskAttributeMapping,
  IFlogoFlowDiagramTaskLink,
  IFlogoFlowDiagramTaskAttributes
} from '../models';
import { FLOGO_TASK_TYPE, FLOGO_TASK_STATUS } from '../../../common/constants';
import { flogoIDEncode } from '../../../common/utils';

export interface IFlogoFlowDiagramTask {
  id : string;
  type : FLOGO_TASK_TYPE;
  version ? : string;
  name ? : string;
  description ? : string;
  title ? : string;
  activityType ? : string;
  attributes ? : IFlogoFlowDiagramTaskAttributes;
  inputMappings ? : IFlogoFlowDiagramTaskAttributeMapping[ ];
  outputMappings ? : IFlogoFlowDiagramTaskAttributeMapping[ ];
  tasks ? : IFlogoFlowDiagramTask[ ];
  links ? : IFlogoFlowDiagramTaskLink[ ];
  status ? : FLOGO_TASK_STATUS;
}

export class FlogoFlowDiagramTask implements IFlogoFlowDiagramTask {
  id : string;
  type : FLOGO_TASK_TYPE;
  version : string;
  name : string;
  description : string;
  title : string;
  activityType : string;
  attributes : IFlogoFlowDiagramTaskAttributes;
  inputMappings : IFlogoFlowDiagramTaskAttributeMapping[ ];
  outputMappings : IFlogoFlowDiagramTaskAttributeMapping[ ];
  tasks : IFlogoFlowDiagramTask[ ];
  links : IFlogoFlowDiagramTaskLink[ ];
  status: FLOGO_TASK_STATUS;

  constructor( task ? : IFlogoFlowDiagramTask ) {
    this.update( task );
  };

  static genTaskID() : string {
    return flogoIDEncode( 'FlogoFlowDiagramTask::' + Date.now() );
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
    this.activityType = task.activityType || this.activityType || '';
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

    if ( !_.isEmpty(task.status)) {
      this.status = task.status;
    }

  };
}

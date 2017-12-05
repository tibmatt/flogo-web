/**
 * Events published from this module
 */
import { IFlogoFlowDiagramTask } from '../shared/diagram/models/task.model';

export const PUB_EVENTS = {
  selectActivity : {
    channel : 'flogo-flow-task-mapper',
    topic : 'select-task'
  },
  saveTransform : {
    channel : 'flogo-flow-task-mapper',
    topic : 'save-transform'
  },
  deleteTransform : {
    channel : 'flogo-flow-task-mapper',
    topic : 'delete-transform'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  selectActivity : {
    channel : 'flogo-flow-task-mapper',
    topic : 'public-select-task'
  },
  saveTransform : {
    channel : 'flogo-flow-task-mapper',
    topic : 'public-save-transform'
  },
  deleteTransform : {
    channel : 'flogo-flow-task-mapper',
    topic : 'public-delete-transform'
  }
};

export interface SelectTaskData {
  handlerId: string;
  // scope
  scope: any[];
  tile: IFlogoFlowDiagramTask;
  overridePropsToMap?: any[];
  overrideMappings?: any[];
  title?: string;
  inputsSearchPlaceholderKey?: string;
}


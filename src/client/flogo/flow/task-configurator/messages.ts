/**
 * Events published from this module
 */
import { IFlogoFlowDiagramTask } from '../shared/diagram/models/task.model';

export const PUB_EVENTS = {
  selectTask : {
    channel : 'flogo-flow-task-configurator',
    topic : 'open-task'
  },
  saveTask : {
    channel : 'flogo-flow-task-configurator',
    topic : 'save-task'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  selectTask : {
    channel : 'flogo-flow-task-configurator',
    topic : 'public-open-task'
  },
  saveTask : {
    channel : 'flogo-flow-task-configurator',
    topic : 'public-save-task'
  }
};

interface IteratorInfo {
  isIterable: boolean;
  iterableValue?: string;
}

export interface SelectTaskConfigEventData {
  handlerId: string;
  // scope
  scope: any[];
  tile: IFlogoFlowDiagramTask;
  overridePropsToMap?: any[];
  overrideMappings?: any[];
  title?: string;
  inputMappingsTabLabelKey?: string;
  inputsSearchPlaceholderKey?: string;
  iterator: IteratorInfo;
}

export interface SaveTaskConfigEventData {
  handlerId: string;
  tile: IFlogoFlowDiagramTask;
  iterator: IteratorInfo;
  inputMappings: any[];
}

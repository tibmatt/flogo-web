/**
 * Events published from this module
 */
import {Task, Action} from '@flogo/core';

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
  tile: Task;
  overridePropsToMap?: any[];
  overrideMappings?: any[];
  title?: string;
  inputMappingsTabLabelKey?: string;
  inputsSearchPlaceholderKey?: string;
  iterator: IteratorInfo;
  subFlowData?: Action;
}

export interface SaveTaskConfigEventData {
  handlerId: string;
  tile: Task;
  iterator: IteratorInfo;
  inputMappings: any[];
}

import { FLOGO_TASK_TYPE, Dictionary } from '@flogo-web/lib-client/core';
import { AttributeMapping } from './attribute-mapping';

export type ItemTask = ItemActivityTask | ItemSubflow;
export type Item = ItemTask | ItemBranch;

export interface BaseItem {
  id: string;
  type: FLOGO_TASK_TYPE;
}

export interface BaseItemSettings {
  iterate?: string;
}

export interface BaseItemTask extends BaseItem {
  ref: string;
  name: string;
  description?: string;
  inputMappings?: Dictionary<any>;
  input: {
    [name: string]: any;
  };
  settings?: BaseItemSettings;
  activitySettings?: { [settingName: string]: any };
}

export interface ItemActivityTask extends BaseItemTask {
  type: FLOGO_TASK_TYPE.TASK;
  return?: boolean;
}

export interface ItemSubflow extends BaseItemTask {
  type: FLOGO_TASK_TYPE.TASK_SUB_PROC;
  outputMappings?: AttributeMapping[];
  settings?: BaseItemSettings & {
    iterate?: string;
    flowPath?: string;
  };
}

export interface ItemBranch extends BaseItem {
  id: string;
  type: FLOGO_TASK_TYPE.TASK_BRANCH;
  condition?: string;
}

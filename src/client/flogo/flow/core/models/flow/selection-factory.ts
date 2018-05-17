import { SelectionType, InsertTaskSelection, TaskSelection, TriggerSelection } from '../selection';
import { HandlerType } from '../handler-type';

export function makeTaskSelection(taskId: string): TaskSelection {
  return {
    type: SelectionType.Task,
    taskId,
  };
}

export function makeInsertSelection(handlerType: HandlerType, parentId: string): InsertTaskSelection {
  return {
    type: SelectionType.InsertTask,
    parentId,
    handlerType,
  };
}

export function makeTriggerSelection(triggerId: string): TriggerSelection {
  return {
    type: SelectionType.Trigger,
    triggerId,
  };
}

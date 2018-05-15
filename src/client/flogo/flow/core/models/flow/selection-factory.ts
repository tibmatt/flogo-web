import { DiagramSelectionType } from '@flogo/packages/diagram/interfaces';

export function makeTaskSelection(taskId: string) {
  return {
    type: DiagramSelectionType.Node,
    taskId,
  };
}

export function makeInsertSelection(diagramId: string, parentTaskId: string) {
  return {
    type: DiagramSelectionType.Insert,
    taskId: parentTaskId,
    diagramId,
  };
}

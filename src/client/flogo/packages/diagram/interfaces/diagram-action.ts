export enum DiagramActionType {
  Select = 'select',
  Insert = 'insert',
  Branch = 'branch',
  Remove = 'remove',
  Configure = 'configure',
}

export interface DiagramAction {
  type: DiagramActionType;
  taskId: string;
}

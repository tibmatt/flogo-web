export enum DiagramActionType {
  Select = 'select',
  Insert = 'insert',
  Branch = 'branch',
  Remove = 'remove',
  Configure = 'configure',
}

export interface DiagramAction {
  type: DiagramActionType;
  diagramId?: string;
}

export interface DiagramActionSelf extends DiagramAction {
  type: DiagramActionType;
  id: string;
}

export interface DiagramActionChild extends DiagramAction {
  type: DiagramActionType.Insert | DiagramActionType.Branch;
  parentId: string;
}


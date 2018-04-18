export enum NodeType {
  Task = 'task',
  Branch = 'branch',
}

export interface NodeFeatures {
  selectable?: boolean;
  canHaveChildren?: boolean;
  canBranch?: boolean;
  deletable?: boolean;
  subflow?: boolean;
  final?: boolean;
}

export interface NodeStatus {
  invalid?: boolean;
  executed?: boolean;
  executionErrored?: string;
  iterable?: boolean;
}

export interface GraphNode {
  id: string;
  type: NodeType;
  children: string[];
  parents: string[];
  features: NodeFeatures;
  status: NodeStatus;
  title?: string;
  description?: string;
}


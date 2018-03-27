export enum NodeType {
  Task = 'task',
  Branch = 'branch',
}

export interface NodeCapabilities {
  selectable?: boolean;
  canHaveChildren?: boolean;
  canBranch?: boolean;
  deletable?: boolean;
}

export interface NodeStatus {
  invalid?: boolean;
  executed?: boolean;
  executionErrored?: boolean;
  iterable?: boolean;
  final?: boolean;
}

export interface Node {
  id: string;
  type: NodeType;
  children: string[];
  parents: string[];
  capabilities: NodeCapabilities;
  status: NodeStatus;
}


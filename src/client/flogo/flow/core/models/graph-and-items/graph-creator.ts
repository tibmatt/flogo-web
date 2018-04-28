import { GraphNode, NodeFeatures, NodeStatus, NodeType } from '../../../../core/index';
import { Dictionary, flow as backendFlow } from '../../../../core/index';

const defaultFeatures: NodeFeatures = {
  selectable: true,
  canHaveChildren: true,
  canBranch: true,
  deletable: true,
  subflow: false,
  final: false,
};

const defaultStatus: NodeStatus = {
  invalid: false,
  executed: false,
  executionErrored: null,
  iterable: false,
};

export function makeTaskNodes(tasks: backendFlow.Task[]): Dictionary<GraphNode> {
  return tasks.reduce((nodes, task) => {
    const node = makeTask(task);
    nodes[node.id] = node;
    return nodes;
  }, {} as Dictionary<GraphNode>);
}

function makeTask(task: backendFlow.Task): GraphNode {
  return makeNode({
    type: NodeType.Task,
    id: task.id,
    features: {
      selectable: true,
      canHaveChildren: true,
    },
    status: {
    },
    title: task.name,
    description: task.description,
  });
}

export function makeBranchNode(id: string, link: backendFlow.Link): GraphNode {
  return makeNode({
    id,
    type: NodeType.Branch,
    parents: [link.from],
    children: [link.to],
  });
}

export function makeNode(from: {id: string, type: NodeType} & Partial<GraphNode>): GraphNode {
  return {
    title: from.id || '',
    description: '',
    ...from,
    children: from.children ? [...from.children] : [],
    parents: from.parents ? [...from.parents] : [],
    features: { ...defaultFeatures, ...from.features },
    status: { ...defaultStatus, ...from.status },
  };
}

import {
  GraphNode,
  Item,
  NodeFeatures,
  NodeStatus,
  NodeType,
  Dictionary,
  flow as backendFlow,
  ItemActivityTask,
  isBranchConfigured,
  isSubflowTask,
} from '@flogo-web/client-core';
import { isIterableTask } from '@flogo-web/plugins/flow-core';

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

export function makeTaskNodes(
  tasks: backendFlow.Task[],
  items: Dictionary<Item>
): Dictionary<GraphNode> {
  return tasks.reduce(
    (nodes, task) => {
      const node = makeTask(task, items[task.id]);
      nodes[node.id] = node;
      return nodes;
    },
    {} as Dictionary<GraphNode>
  );
}

function makeTask(task: backendFlow.Task, item: Item): GraphNode {
  const isFinal = (<ItemActivityTask>item).return;
  return makeNode({
    type: NodeType.Task,
    id: task.id,
    title: task.name,
    description: task.description,
    features: {
      selectable: true,
      deletable: true,
      canHaveChildren: !isFinal,
      subflow: isSubflowTask(item.type),
      final: isFinal,
    },
    status: {
      iterable: isIterableTask(item),
    },
  });
}

export function makeBranchNode(id: string, link: backendFlow.Link): GraphNode {
  return makeNode({
    id,
    type: NodeType.Branch,
    parents: [link.from],
    children: [link.to],
    status: { isBranchConfigured: isBranchConfigured(link.value) },
  });
}

export function makeNode(
  from: { id: string; type: NodeType } & Partial<GraphNode>
): GraphNode {
  return {
    ...from,
    children: from.children ? [...from.children] : [],
    parents: from.parents ? [...from.parents] : [],
    features: { ...defaultFeatures, ...from.features },
    status: { ...defaultStatus, ...from.status },
  };
}

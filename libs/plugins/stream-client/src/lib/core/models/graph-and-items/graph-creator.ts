import { get, isNil } from 'lodash';
import {
  GraphNode,
  NodeFeatures,
  NodeStatus,
  NodeType,
  Dictionary,
} from '@flogo-web/lib-client/core';

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

export function makeTaskNodes(tasks, items: Dictionary<any>): Dictionary<GraphNode> {
  return tasks.reduce(
    (nodes, task) => {
      const node = makeTask(task, items[task.id]);
      nodes[node.id] = node;
      return nodes;
    },
    {} as Dictionary<GraphNode>
  );
}

function makeTask(task, item): GraphNode {
  const isFinal = item.return;
  return makeNode({
    type: NodeType.Task,
    id: task.id,
    title: task.name,
    description: task.description,
    features: {
      selectable: true,
      deletable: true,
      canHaveChildren: !isFinal,
      subflow: item.type === 4,
      final: isFinal,
    },
    status: {
      iterable: isIterableTask(item),
    },
  });
}

export function makeBranchNode(id: string, link): GraphNode {
  return makeNode({
    id,
    type: NodeType.Branch,
    parents: [link.from],
    children: [link.to],
    status: { isBranchConfigured: link.value && link.value !== 'true' },
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

function isIterableTask(task): boolean {
  return isAcceptableIterateValue(get(task, 'settings.iterate'));
}

function isAcceptableIterateValue(value: any) {
  return !isNil(value) && value !== '';
}

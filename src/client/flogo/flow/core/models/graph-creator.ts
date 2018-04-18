import { uniqueId } from 'lodash';
import { FlowGraph, GraphNode, NodeFeatures, NodeStatus, NodeType } from '@flogo/core';
import { ContribSchema, Dictionary, flow as backendFlow } from '@flogo/core';
import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE } from '@flogo/flow/shared/diagram/constants';

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

export function makeGraph(tasks: backendFlow.Task[], links: backendFlow.Link[], contribSchemas: Dictionary<ContribSchema>): FlowGraph {
  let nodes = makeTaskNodes(tasks);
  nodes = createAndAppendBranches(nodes, links);

  const [rootTask] = tasks;
  return {
    rootId: rootTask ? rootTask.id : null,
    nodes,
  };
}

function makeTaskNodes(tasks: backendFlow.Task[]): Dictionary<GraphNode> {
  return tasks.reduce((nodes, task) => {
    const node = makeTask(task);
    nodes[node.id] = node;
    return nodes;
  }, {} as Dictionary<GraphNode>);
}

function createAndAppendBranches(nodes: Dictionary<GraphNode>, links: backendFlow.Link[]) {
  links.forEach(link => {
    const parentNode = nodes[link.from];
    const childNode = nodes[link.to];
    if (!parentNode || !childNode) {
      return;
    }
    if (link.type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH) {
      const branchNode = makeBranch(link);
      childNode.parents.push(branchNode.id);
      parentNode.children.push(branchNode.id);
      nodes[branchNode.id] = branchNode;
    } else {
      childNode.parents.push(parentNode.id);
      parentNode.children.push(childNode.id);
    }
  });
  return nodes;
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

function makeBranch(link: backendFlow.Link): GraphNode {
  return makeNode({
    type: NodeType.Branch,
    id: uniqueId('branch::'),
    parents: [link.from],
    children: [link.to],
  });
}

function makeNode(from: {id: string, type: NodeType} & Partial<GraphNode>): GraphNode {
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

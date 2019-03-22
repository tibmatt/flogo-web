import { fromPairs } from 'lodash';

import {
  ActivitySchema,
  FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE,
  ContribSchema,
  Dictionary,
  flow as backendFlow,
  FlowGraph,
  GraphNode,
  Item,
  isSubflowTask,
} from '@flogo-web/lib-client/core';

import { makeTaskNodes, makeBranchNode } from './graph-creator';
import { makeBranchItem, makeTaskItems } from './items-creator';
import { CONTRIB_REFS } from '@flogo-web/core';

type Task = backendFlow.Task;
type Link = backendFlow.Link;

export type BranchIdGenerator = () => string;

export function makeGraphAndItems(
  tasks: Task[],
  links: Link[],
  contribSchemas: ContribSchema[],
  getNewBranchId: BranchIdGenerator
): { items: Dictionary<Item>; graph: FlowGraph } {
  const getActivitySchema = activitySchemaFinder(contribSchemas);
  const taskItems = makeTaskItems(tasks, getActivitySchema);
  const taskNodes = makeTaskNodes(tasks, taskItems);

  const { nodes, items } = createAndAppendBranches(
    links,
    getNewBranchId,
    taskItems,
    taskNodes
  );
  const [rootTask] = tasks;
  return {
    items,
    graph: {
      rootId: rootTask ? rootTask.id : null,
      nodes,
    },
  };
}

function createAndAppendBranches(
  links: backendFlow.Link[],
  getNewBranchId: BranchIdGenerator,
  items: Dictionary<Item>,
  nodes: Dictionary<GraphNode>
) {
  links.forEach(link => {
    const parentNode = nodes[link.from];
    const childNode = nodes[link.to];
    if (!parentNode || !childNode) {
      return;
    }
    const hasCondition = link.type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH;
    if (hasCondition) {
      const branchId = getNewBranchId();
      items[branchId] = makeBranchItem(branchId, link);
      nodes[branchId] = makeBranchNode(branchId, link);
      childNode.parents.push(branchId);
      parentNode.children.push(branchId);
    } else {
      childNode.parents.push(parentNode.id);
      parentNode.children.push(childNode.id);
    }
  });
  return { nodes, items };
}

function activitySchemaFinder(contribSchemas: ContribSchema[]) {
  const schemaDictionary = fromPairs(contribSchemas.map(schema => [schema.ref, schema]));
  return (task: Task): Partial<ActivitySchema> => {
    if (isSubflowTask(task.type)) {
      return { ref: CONTRIB_REFS.SUBFLOW };
    }
    return schemaDictionary[task.activityRef] as ActivitySchema;
  };
}

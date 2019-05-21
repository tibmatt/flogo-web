import { fromPairs } from 'lodash';

import { CONTRIB_REFS, ActivitySchema, ContributionSchema } from '@flogo-web/core';
import { Dictionary, FlowGraph, GraphNode } from '@flogo-web/lib-client/core';

import { makeTaskNodes, makeBranchNode } from './graph-creator';
import { makeBranchItem, makeTaskItems } from './items-creator';

export type BranchIdGenerator = () => string;

export function makeGraphAndItems(
  tasks,
  links,
  contribSchemas: ContributionSchema[],
  getNewBranchId: BranchIdGenerator
): { items: Dictionary<any>; graph: FlowGraph } {
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
  links,
  getNewBranchId: BranchIdGenerator,
  items: Dictionary<any>,
  nodes: Dictionary<GraphNode>
) {
  links.forEach(link => {
    const parentNode = nodes[link.from];
    const childNode = nodes[link.to];
    if (!parentNode || !childNode) {
      return;
    }
    const hasCondition = link.type === 1;
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

function activitySchemaFinder(contribSchemas: ContributionSchema[]) {
  const schemaDictionary = fromPairs(contribSchemas.map(schema => [schema.ref, schema]));
  return (task): Partial<ActivitySchema> => {
    if (task.type === 4) {
      return { ref: CONTRIB_REFS.SUBFLOW };
    }
    return schemaDictionary[task.activityRef] as ActivitySchema;
  };
}

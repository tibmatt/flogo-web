import { TaskDictionary, Node, NodeDictionary } from '@flogo/core/interfaces';
import { FLOGO_TASK_TYPE } from '@flogo/core/constants';
import { FlogoFlowDiagram } from '@flogo/flow/shared/diagram/models/diagram.model';

export function updateBranchNodesRunStatus(nodes: NodeDictionary,
                                           tasks: TaskDictionary) {

  _.forIn(nodes, (node: Node) => {
    const task = tasks[node.taskID];

    if (task.type === FLOGO_TASK_TYPE.TASK_BRANCH) {
      _.set(task, '__status.hasRun', FlogoFlowDiagram.hasBranchRun(node, tasks, nodes));
    }
  });

}

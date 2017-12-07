import { IFlogoFlowDiagramNodeDictionary, IFlogoFlowDiagramTaskDictionary } from '@flogo/flow/shared/diagram/models/dictionary.model';
import { IFlogoFlowDiagramNode } from '@flogo/flow/shared/diagram/models/node.model';
import { FLOGO_TASK_TYPE } from '@flogo/core/constants';
import { FlogoFlowDiagram } from '@flogo/flow/shared/diagram/models/diagram.model';

export function updateBranchNodesRunStatus(nodes: IFlogoFlowDiagramNodeDictionary,
                                           tasks: IFlogoFlowDiagramTaskDictionary) {

  _.forIn(nodes, (node: IFlogoFlowDiagramNode) => {
    const task = tasks[node.taskID];

    if (task.type === FLOGO_TASK_TYPE.TASK_BRANCH) {
      _.set(task, '__status.hasRun', FlogoFlowDiagram.hasBranchRun(node, tasks, nodes));
    }
  });

}

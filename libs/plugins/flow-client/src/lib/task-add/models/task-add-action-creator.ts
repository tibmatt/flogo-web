import { assign } from 'lodash';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import {
  CONTRIB_REF_PLACEHOLDER,
  ItemActivityTask,
  ItemSubflow,
  NodeType,
  Task,
  activitySchemaToTask,
  createSubFlowTask,
  isSubflowTask,
  extractItemInputsFromTask,
  taskIdGenerator,
} from '@flogo-web/client-core';

import { FlowState, FlowActions, FlowSelectors } from '../../core/state';
import { PayloadOf } from '../../core/state/utils';
import { makeNode } from '../../core/models/graph-and-items/graph-creator';
import { HandlerType, InsertTaskSelection } from '../../core/models';
import { uniqueTaskName } from '../../core/models/unique-task-name';

interface TaskAddData {
  ref: string;
  flowData?: any;
}

export function createTaskAddAction(
  store: Store<FlowState>,
  activityToAdd: TaskAddData
): Observable<FlowActions.TaskItemCreated> {
  return store.pipe(
    select(FlowSelectors.selectFlowState),
    take(1),
    map(
      flowState =>
        new FlowActions.TaskItemCreated(createNewTask(flowState, activityToAdd))
    )
  );
}

function createNewTask(
  flowState: FlowState,
  activityData: TaskAddData
): PayloadOf<FlowActions.TaskItemCreated> {
  const selection = flowState.currentSelection as InsertTaskSelection;
  const handlerType =
    selection.handlerType === HandlerType.Main ? HandlerType.Main : HandlerType.Error;
  const schema = flowState.schemas[activityData.ref];
  const { errorItems, mainItems } = flowState;
  const task = createTask({
    activitySchema: schema,
    data: activityData,
    errorItems,
    mainItems,
  });
  const isFinal = !!task.return;
  const isSubflow = isSubflowTask(task.type);
  const item: ItemActivityTask | ItemSubflow = createItem(task, isSubflow);
  const node = makeNode({
    id: task.id,
    type: NodeType.Task,
    title: task.name,
    description: task.description,
    parents: [selection.parentId],
    features: {
      subflow: isSubflow,
      final: isFinal,
      canHaveChildren: !isFinal,
    },
  });
  return {
    handlerType,
    item,
    node,
    subflowSchema: activityData.flowData,
  };
}

function createTask({ data, activitySchema, mainItems, errorItems }) {
  let task;
  if (data.ref === CONTRIB_REF_PLACEHOLDER.REF_SUBFLOW) {
    const {
      flowData: { name, description, id: actionId },
    } = data;
    task = {
      ...createSubFlowTask(activitySchema),
      name,
      description,
    };
    task.settings = task.settings || {};
    task.settings.flowPath = actionId;
  } else {
    task = activitySchemaToTask(activitySchema);
  }
  const taskName = uniqueTaskName(task.name, mainItems, errorItems);
  task = <Task>assign({}, task, {
    id: taskIdGenerator({ ...mainItems, ...errorItems }, task),
    name: taskName,
  });
  return task;
}

function createItem(task, isSubflow) {
  let item: ItemActivityTask | ItemSubflow = {
    id: task.id,
    type: task.type,
    ref: task.ref,
    name: task.name,
    description: task.description,
    inputMappings: task.inputMappings,
    input: extractItemInputsFromTask(task),
    settings: task.settings,
  };
  if (isSubflow) {
    item = {
      ...item,
      outputMappings: task.outputMappings,
    } as ItemSubflow;
  } else {
    (<ItemActivityTask>item).return = task.return;
  }
  return item;
}

import {select, Store} from '@ngrx/store';
import {FlowState, FlowActions, FlowSelectors} from '../../core/state/index';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {PayloadOf} from '../../core/state/utils';
import {activitySchemaToTask, createSubFlowTask, getProfileType, isSubflowTask} from '@flogo/shared/utils';
import {CONTRIB_REF_PLACEHOLDER, ItemActivityTask, ItemSubflow, NodeType, Task} from '@flogo/core';
import {assign} from 'lodash';
import {uniqueTaskName} from '@flogo/flow/core/models/unique-task-name';
import {extractItemInputsFromTask, taskIdGenerator} from '@flogo/core/models';
import {makeNode} from '@flogo/flow/core/models/graph-and-items/graph-creator';
import {HandlerType, InsertTaskSelection} from '@flogo/flow/core/models';

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
    map(flowState => new FlowActions.TaskItemCreated(createNewTask(flowState, activityToAdd)))
  );
}

function createNewTask(flowState: FlowState, activityData: TaskAddData): PayloadOf<FlowActions.TaskItemCreated> {
  const selection = flowState.currentSelection as InsertTaskSelection;
  const handlerType = selection.handlerType === HandlerType.Main ? HandlerType.Main : HandlerType.Error;
  const schema = flowState.schemas[activityData.ref];
  const profileType = getProfileType(flowState.app);
  const {errorItems, mainItems} = flowState;
  const task = createTask({profileType, activitySchema: schema, data: activityData, errorItems, mainItems});
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
      canHaveChildren: !isFinal
    }
  });
  return {
    handlerType,
    item,
    node,
    subflowSchema: activityData.flowData
  };
}

function createTask({profileType, data, activitySchema, mainItems, errorItems}) {
  let task;
  if (data.ref === CONTRIB_REF_PLACEHOLDER.REF_SUBFLOW) {
    const {flowData: {name, description, id: actionId}} = data;
    task = {
      ...createSubFlowTask(activitySchema),
      name,
      description
    };
    task.settings = task.settings || {};
    task.settings.flowPath = actionId;
  } else {
    task = activitySchemaToTask(activitySchema);
  }
  const taskName = uniqueTaskName(task.name, mainItems, errorItems);
  task = <Task> assign({}, task, {
    id: taskIdGenerator(profileType, {...mainItems, ...errorItems}, task),
    name: taskName
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

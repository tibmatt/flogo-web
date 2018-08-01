import {select, Store} from '@ngrx/store';
import {FlowState, FlowActions, FlowSelectors} from '../../core/state/index';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {PayloadOf} from '../../core/state/utils';
import {activitySchemaToTask, createSubFlowTask, getProfileType, isSubflowTask} from '@flogo/shared/utils';
import {CONTRIB_REF_PLACEHOLDER, FLOGO_PROFILE_TYPE, ItemActivityTask, ItemSubflow, NodeType, Task} from '@flogo/core';
import {assign} from 'lodash';
import {uniqueTaskName} from '@flogo/flow/core/models/unique-task-name';
import {extractItemInputsFromTask, FlogoDeviceTaskIdGeneratorService, FlogoMicroserviceTaskIdGeneratorService} from '@flogo/core/models';
import {makeNode} from '@flogo/flow/core/models/graph-and-items/graph-creator';
import {HandlerType, InsertTaskSelection} from '@flogo/flow/core/models';
import {AbstractTaskIdGenerator} from '@flogo/core/models/profile/profile-utils';

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
  let utils: AbstractTaskIdGenerator;
  if (profileType === FLOGO_PROFILE_TYPE.MICRO_SERVICE) {
    utils = new FlogoMicroserviceTaskIdGeneratorService();
  } else {
    utils = new FlogoDeviceTaskIdGeneratorService();
  }
  let task;
  if (activityData.ref === CONTRIB_REF_PLACEHOLDER.REF_SUBFLOW) {
    const {flowData: {name, description, id: actionId}} = activityData;
    task = {
      ...createSubFlowTask(schema),
      name,
      description
    };
    task.settings = task.settings || {};
    task.settings.flowPath = actionId;
  } else {
    task = activitySchemaToTask(schema);
  }
  const taskName = uniqueTaskName(task.name, flowState.mainItems, flowState.errorItems);
  task = <Task> assign({}, task, {
    id: utils.generateTaskID({...flowState.mainItems, ...flowState.errorItems}, task),
    name: taskName
  });
  let item: ItemActivityTask | ItemSubflow = {
    id: task.id,
    type: task.type,
    ref: task.ref,
    name: taskName,
    description: task.description,
    inputMappings: task.inputMappings,
    input: extractItemInputsFromTask(task),
    settings: task.settings,
  };
  const isSubflow = isSubflowTask(item.type);
  const isFinal = !!task.return;
  if (isSubflow) {
    item = {
      ...item,
      outputMappings: task.outputMappings,
    } as ItemSubflow;
  } else {
    (<ItemActivityTask>item).return = task.return;
  }
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

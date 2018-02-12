import { FLOGO_ERROR_ROOT_NAME, ValueTypes, FLOGO_TASK_TYPE } from '@flogo/core/constants';
import { flogoIDEncode } from '@flogo/shared/utils';
import { AttributeMapping, TaskAttributes, Link, Task } from '@flogo/core';

export class FlogoFlowDiagramTask implements Task {
  id: string;
  type: FLOGO_TASK_TYPE;
  version: string;
  name: string;
  description: string;
  activityType: string;
  ref: string;
  triggerType: string;
  attributes: TaskAttributes;
  inputMappings: AttributeMapping[ ];
  outputMappings: AttributeMapping[ ];
  tasks: Task[ ];
  links: Link[ ];
  settings?: {
    iterate?: string;
  };
  __status: {
    [key: string]: boolean;
  };

  static genTaskID(): string {
    return flogoIDEncode('FlogoFlowDiagramTask::' + Date.now());
  }

  constructor(task ?: Task) {
    this.update(task);
  }

  update(task: Task) {
    if (!task) {
      task = < Task > {};
    }

    this.id = task.id || this.id || FlogoFlowDiagramTask.genTaskID();
    // TODO: Fix it will always reassign FLOGO_TASK_TYPE FLOGO_TASK_TYPE.TASK_ROOT is 0, so in the case
    this.type = task.type || this.type || FLOGO_TASK_TYPE.TASK;
    this.version = task.version || this.version || '';
    this.name = task.name || this.name || 'new task';
    this.description = task.description || this.description || '';
    this.activityType = task.activityType || this.activityType || '';
    this.ref = task.ref || this.ref || '';

    this.triggerType = task.triggerType || this.triggerType || '';
    this.attributes = _.isEmpty(task.attributes) ?
      this.attributes || < TaskAttributes > {} :
      _.cloneDeep(task.attributes);
    this.inputMappings = _.isEmpty(task.inputMappings) ? this.inputMappings || [] : _.cloneDeep(task.inputMappings);
    this.outputMappings = _.isEmpty(task.outputMappings) ?
      this.outputMappings || [] :
      _.cloneDeep(task.outputMappings);

    this.settings = task.settings || {};

    if (!_.isEmpty(task.tasks)) {
      this.tasks = _.cloneDeep(task.tasks);
    }

    if (!_.isEmpty(task.links)) {
      this.links = _.cloneDeep(task.links);
    }

    if (!_.isEmpty(task.__status)) {
      this.__status = _.cloneDeep(task.__status);
    }

  }
}

export function makeDefaultErrorTrigger(id): Task {

  const outputs = [
    {
      name: 'activity',
      type: ValueTypes.STRING,
      title: 'activity',
      value: ''
    },
    {
      name: 'message',
      type: ValueTypes.STRING,
      title: 'message',
      value: ''
    },
    {
      name: 'data',
      type: ValueTypes.ANY,
      title: 'data',
      value: ''
    }
  ];


  const errorTrigger = new FlogoFlowDiagramTask({
    id: id,
    name: 'On Error',
    // title: 'On Error',
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    triggerType: FLOGO_ERROR_ROOT_NAME,
    attributes: {
      outputs
    }
  });

  // we set it here instead of the constructor because TASK_ROOT == 0 see note inside FlogoFlowDiagramTask
  errorTrigger.type = FLOGO_TASK_TYPE.TASK_ROOT;
  (<any>errorTrigger).outputs = outputs;
  return errorTrigger;
}

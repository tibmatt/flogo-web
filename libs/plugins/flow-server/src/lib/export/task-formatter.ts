import { isEmpty } from 'lodash';

import { Task, createResourceUri, Resource } from '@flogo-web/core';
import { isSubflowTask, TASK_TYPE } from '@flogo-web/server/core';
import { isIterableTask } from '@flogo-web/plugins/flow-core';
import { Dictionary } from '@flogo-web/client-core';

export class TaskFormatter {
  private sourceTask: Task;

  constructor(private resourceIdReconciler: Map<string, Resource>) {}

  setSourceTask(sourceTask) {
    this.sourceTask = sourceTask;
    return this;
  }

  convert(isMapperType: boolean) {
    const { id, name, description, activityRef } = this.sourceTask;
    const {
      type,
      taskSettings,
      activitySettings,
      input,
    } = this.resolveActivityProperties(isMapperType);
    return {
      id,
      type,
      name: !isEmpty(name) ? name : undefined,
      description: !isEmpty(description) ? description : undefined,
      settings: !isEmpty(taskSettings) ? taskSettings : undefined,
      activity: {
        ref: activityRef,
        input: !isEmpty(input) ? input : undefined,
        settings: !isEmpty(activitySettings) ? activitySettings : undefined,
      },
    };
  }

  resolveActivityProperties(isMapperType) {
    const taskSettings: {
      iterate?: string;
    } = {};
    const activitySettings: {
      flowURI?: string;
      mappings?: Dictionary<any>;
    } = {};
    // for type 'standard' we will omit the 'type' property as a task is 'standard' by default
    let type;
    if (isSubflowTask(this.sourceTask)) {
      activitySettings.flowURI = this.convertSubflowPath();
    } else if (isMapperType) {
      activitySettings.mappings = this.sourceTask.inputMappings;
    }
    let input = {};
    if (!isMapperType) {
      input = this.sourceTask.inputMappings;
    }
    if (this.isIteratorTask()) {
      type = TASK_TYPE.ITERATOR;
      taskSettings.iterate = this.sourceTask.settings.iterate;
    }
    return { type, taskSettings, activitySettings, input };
  }

  convertSubflowPath() {
    const settings = this.sourceTask.settings;
    const resourceId = this.resourceIdReconciler.get(settings.flowPath).id;
    return createResourceUri(resourceId);
  }

  isIteratorTask() {
    return isIterableTask(this.sourceTask);
  }
}

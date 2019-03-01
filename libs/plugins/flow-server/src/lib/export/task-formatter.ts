import { isEmpty } from 'lodash';

import { Task, createResourceUri } from '@flogo-web/core';
import { isSubflowTask, TASK_TYPE } from '@flogo-web/server/core';
import { isIterableTask } from '@flogo-web/plugins/flow-core';

export class TaskFormatter {
  private sourceTask: Task;

  constructor(private resourceIdReconciler: Map<string, string>) {}

  setSourceTask(sourceTask) {
    this.sourceTask = sourceTask;
    return this;
  }

  convert(isMapperType: boolean) {
    const { id, name, description, activityRef, inputMappings } = this.sourceTask;
    const { type, taskSettings, activitySettings } = this.resolveTypeAndSettings();
    const input = isMapperType ? { mappings: inputMappings } : inputMappings;
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

  resolveTypeAndSettings() {
    const taskSettings: {
      iterate?: string;
    } = {};
    const activitySettings: {
      flowURI?: string;
    } = {};
    // for type 'standard' we will omit the 'type' property as a task is 'standard' by default
    let type;
    if (isSubflowTask(this.sourceTask)) {
      activitySettings.flowURI = this.convertSubflowPath();
    }
    if (this.isIteratorTask()) {
      type = TASK_TYPE.ITERATOR;
      taskSettings.iterate = this.sourceTask.settings.iterate;
    }
    return { type, taskSettings, activitySettings };
  }

  convertSubflowPath() {
    const settings = this.sourceTask.settings;
    const resourceId = this.resourceIdReconciler.get(settings.flowPath);
    return createResourceUri(resourceId);
  }

  isIteratorTask() {
    return isIterableTask(this.sourceTask);
  }
}

import { isEmpty } from 'lodash';

import { Task, createResourceUri, Resource, MapperUtils } from '@flogo-web/core';
import { isSubflowTask, TASK_TYPE, AppImportsAgent } from '@flogo-web/server/core';
import { isIterableTask } from '@flogo-web/plugins/flow-core';

interface Mappings {
  [propertyName: string]: string;
}

const createFnAccumulator = (registerFunction: (string) => void) => {
  return (mappings: Mappings) => {
    MapperUtils.functions
      .parseAndExtractReferencesInMappings(mappings || {})
      .forEach(registerFunction);
  };
};

export class TaskFormatter {
  private sourceTask: Task;
  readonly accumulateFunctions: (mappings: Mappings) => void;

  constructor(
    private resourceIdReconciler: Map<string, Resource>,
    private importsAgent: AppImportsAgent
  ) {
    this.accumulateFunctions = createFnAccumulator(
      importsAgent.registerFunctionName.bind(importsAgent)
    );
  }

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
        type: this.importsAgent.registerRef(activityRef),
        input: !isEmpty(input) ? input : undefined,
        settings: !isEmpty(activitySettings) ? activitySettings : undefined,
      },
    };
  }

  resolveActivityProperties(isMapperType) {
    const taskSettings: {
      iterate?: string;
    } = {};
    let activitySettings: {
      flowURI?: string;
      mappings?: { [flowOutput: string]: any };
    } = {};
    // for type 'standard' we will omit the 'type' property as a task is 'standard' by default
    let type;
    if (isSubflowTask(this.sourceTask)) {
      activitySettings.flowURI = this.convertSubflowPath();
    } else if (isMapperType) {
      activitySettings.mappings = this.sourceTask.inputMappings;
    } else {
      activitySettings = this.sourceTask.activitySettings;
    }

    let input = {};
    if (!isMapperType) {
      input = this.sourceTask.inputMappings;
    }
    if (this.isIteratorTask()) {
      type = TASK_TYPE.ITERATOR;
      taskSettings.iterate = this.sourceTask.settings.iterate;
    }
    this.accumulateFunctions(taskSettings);
    this.accumulateFunctions(this.sourceTask.inputMappings);
    this.accumulateFunctions(this.sourceTask.activitySettings);
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

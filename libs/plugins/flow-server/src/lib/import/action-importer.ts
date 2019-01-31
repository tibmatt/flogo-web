import { isEmpty } from 'lodash';
import {
  Resource,
  ResourceImportContext,
  actionHasSubflowTasks,
  forEachSubflowTaskInAction,
  LINK_TYPE,
  fromStandardTypeMapper,
} from '@flogo-web/server/core';

import { TaskConverter } from './task-converter';
import { FlowData } from '../flow';
import { validate } from './validator';

export class ActionImporter {
  protected activitySchemasByRef: Map<string, any>;

  constructor(
    private taskConverterFactory: (resourceTask, activitySchema) => TaskConverter
  ) {}

  async importApp(
    inResource: Resource,
    context: ResourceImportContext
  ): Promise<Resource<FlowData>> {
    validate(inResource.data);
    this.activitySchemasByRef = context.contributions;
    let resource = this.resourceToAction(inResource);
    if (actionHasSubflowTasks(resource)) {
      resource = this.reconcileSubflowTasksInAction(
        resource,
        context.normalizedResourceIds
      );
    }
    return resource;
  }

  reconcileSubflowTasksInAction(action, actionsByOriginalId: Map<string, string>) {
    forEachSubflowTaskInAction(action, task => {
      const originalFlowPath = task.settings.flowPath;
      task.settings.flowPath = actionsByOriginalId.get(originalFlowPath);
    });
    return action;
  }

  resourceToAction(resource: Resource): Resource<FlowData> {
    const resourceData: any = resource.data || {};
    const errorHandler = this.getErrorHandler(resourceData);
    return {
      ...resource,
      metadata: this.extractMetadata(resourceData),
      data: {
        tasks: this.mapTasks(resourceData.tasks),
        links: this.mapLinks(resourceData.links),
        errorHandler,
      },
    };
  }

  getErrorHandler(resourceData) {
    const { errorHandler } = resourceData;
    if (isEmpty(errorHandler) || isEmpty(errorHandler.tasks)) {
      return undefined;
    }
    return {
      tasks: this.mapTasks(errorHandler.tasks),
      links: this.mapLinks(errorHandler.links),
    };
  }

  mapLinks(resourceLinks = []) {
    return resourceLinks.map((link, index) => ({
      id: index,
      ...link,
      type: fromStandardTypeMapper.linkTypes[link.type || LINK_TYPE.SUCCESS],
    }));
  }

  extractMetadata(resourceData) {
    const metadata = { ...resourceData.metadata };
    metadata.input = metadata.input || [];
    metadata.output = metadata.output || [];
    return metadata;
  }

  actionIdFromResourceId(resourceId) {
    return resourceId.replace(/^flow:`/gi, '');
  }

  mapTasks(tasks = []) {
    return tasks.map(task => this.convertTask(task));
  }

  convertTask(resourceTask) {
    const activitySchema = this.activitySchemasByRef.get(resourceTask.activity.ref);
    return this.taskConverterFactory(resourceTask, activitySchema).convert();
  }
}

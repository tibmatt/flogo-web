import isEmpty from 'lodash/isEmpty';
import { FLOGO_TASK_TYPE, LEGACY_FLOW_TYPE } from '../../../common/constants';
import { LINK_TYPE } from '../../transfer/common/type-mapper';
import { AbstractActionsImporter } from '../common';
import { fromStandardTypeMapper } from './utils';

export class StandardActionsImporter extends AbstractActionsImporter {

  /**
   * @param {ActionsManager} actionStorage
   * @param {typeof StandardTaskConverter} taskConverterFactory
   * @param {{ref: string}[]} activitySchemas
   */
  constructor(actionStorage, taskConverterFactory, activitySchemas) {
    if (!activitySchemas) {
      throw new TypeError('Missing parameter: activitySchemas');
    }
    if (!taskConverterFactory) {
      throw new TypeError('Missing parameter: taskConverterFactory');
    }
    super(actionStorage, activitySchemas);
    this.taskConverterFactory = taskConverterFactory;
    this.activitySchemasByRef = activitySchemas
      .reduce(
        (registry, activity) => registry.set(activity.ref, activity),
        new Map(),
      );
  }

  extractActions(fromRawApp) {
    const resources = fromRawApp.resources || [];
    return resources.map(resource => this.resourceToAction(resource));
  }

  resourceToAction(resource = {}) {
    const resourceData = resource.data || {};
    return {
      id: this.actionIdFromResourceId(resource.id),
      name: resourceData.name,
      description: resourceData.description,
      metadata: this.extractMetadata(resourceData),
      data: {
        flow: this.makeFlow(resourceData),
      },
    };
  }

  makeFlow(resourceData) {
    const errorHandlerTask = this.getErrorHandler(resourceData);
    return {
      type: LEGACY_FLOW_TYPE,
      rootTask: {
        id: 'root',
        type: FLOGO_TASK_TYPE.TASK,
        tasks: this.mapTasks(resourceData.tasks),
        links: this.mapLinks(resourceData.links),
      },
      errorHandlerTask,
    };
  }

  getErrorHandler(resourceData) {
    const { errorHandler } = resourceData;
    if (isEmpty(errorHandler) || isEmpty(errorHandler.tasks)) {
      return undefined;
    }
    return {
      id: 'errorHandler',
      type: FLOGO_TASK_TYPE.TASK,
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
    return this.taskConverterFactory
      .create(resourceTask, activitySchema)
      .convert();
  }
}

import isEmpty from 'lodash/isEmpty';
import { FLOGO_TASK_TYPE, LEGACY_FLOW_TYPE } from '../../../common/constants';
import { AbstractActionsImporter } from '../common';
import { typeMapper, LINK_TYPE } from './utils';

export class StandardActionsImporter extends AbstractActionsImporter {

  /**
   * @param {ActionsManager} actionStorage
   * @param {typeof StandardTaskConverter} taskConverterFactory
   * @param {{ref: string}[]} activitySchemas
   */
  constructor(actionStorage, taskConverterFactory, activitySchemas) {
    super(actionStorage);
    if (!activitySchemas) {
      throw new TypeError('Missing parameter: activitySchemas');
    }
    if (!taskConverterFactory) {
      throw new TypeError('Missing parameter: taskConverterFactory');
    }
    this.taskConverterFactory = taskConverterFactory;
    this.typeMapper = typeMapper.fromStandard();
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
      description: resourceData.description,
      rootTask: {
        id: 'root',
        type: FLOGO_TASK_TYPE.TASK,
        tasks: this.mapTasks(resourceData.tasks),
        links: this.mapLinks(resourceData.links),
      },
      errorHandlerTask,
    };
  }

  getErrorHandler(resource) {
    const { errorHandler } = resource.data;
    if (isEmpty(errorHandler) || isEmpty(errorHandler.tasks)) {
      return null;
    }
    return {
      id: 'errorHandler',
      type: FLOGO_TASK_TYPE.TASK,
      tasks: this.mapTasks(errorHandler.tasks),
      links: this.mapLinks(errorHandler.links),
    };
  }

  mapLinks(resourceLinks = []) {
    return resourceLinks.map(link => ({
      ...link,
      type: this.typeMapper.linkTypes[link.type || LINK_TYPE.SUCCESS],
    }));
  }

  extractMetadata(resource) {
    const metadata = { ...resource.data.metadata };
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

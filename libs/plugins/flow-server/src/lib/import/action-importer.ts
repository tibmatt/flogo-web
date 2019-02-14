import { isEmpty } from 'lodash';
import {
  Resource,
  ResourceImportContext,
  actionHasSubflowTasks,
  forEachSubflowTaskInAction,
  LINK_TYPE,
  fromStandardTypeMapper,
  createValidator,
  Schemas,
  ValidationRuleFactory,
  ValidationError,
} from '@flogo-web/server/core';

import { TaskConverter } from './task-converter';
import { FlowData } from '../flow';

export class ActionImporter {
  protected activitySchemasByRef: Map<string, any>;

  constructor(
    private taskConverterFactory: (resourceTask, activitySchema) => TaskConverter
  ) {}

  importAction(inResource: Resource, context: ResourceImportContext): Resource<FlowData> {
    const validate = makeValidator(Array.from(context.contributions.keys()));
    const errors = validate(inResource);
    if (errors) {
      throw new ValidationError('Flow data validation errors', errors);
    }
    this.activitySchemasByRef = context.contributions;
    let resource = this.resourceToAction(inResource);
    if (actionHasSubflowTasks(resource.data)) {
      resource = this.reconcileSubflowTasksInAction(
        resource,
        context.normalizedResourceIds
      );
    }
    return resource;
  }

  reconcileSubflowTasksInAction(
    resource: Resource<FlowData>,
    actionsByOriginalId: Map<string, string>
  ): Resource<FlowData> {
    forEachSubflowTaskInAction(resource.data, task => {
      const originalFlowPath = task.settings.flowPath;
      task.settings.flowPath = actionsByOriginalId.get(originalFlowPath);
    });
    return resource;
  }

  resourceToAction(resource: Resource): Resource<FlowData> {
    const resourceData: any = resource.data || {};
    const errorHandler = this.getErrorHandler(resourceData);
    return {
      ...resource,
      metadata: this.extractMetadata(resource),
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

  mapTasks(tasks = []) {
    return tasks.map(task => this.convertTask(task));
  }

  convertTask(resourceTask) {
    const activitySchema = this.activitySchemasByRef.get(resourceTask.activity.ref);
    return this.taskConverterFactory(resourceTask, activitySchema).convert();
  }
}

function makeValidator(installedRefs: string[]) {
  return createValidator(
    {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'http://github.com/TIBCOSoftware/flogo/schemas/1.0.0/flowResource.json',
      additionalProperties: true,
      required: ['data'],
      properties: {
        data: {
          $ref: 'flow.json',
        },
      },
    },
    {
      removeAdditional: true,
      schemas: [Schemas.v1.flow, Schemas.v1.common],
    },
    [
      {
        keyword: 'activity-installed',
        validate: ValidationRuleFactory.contributionInstalled(
          'activity-installed',
          'activity',
          installedRefs || []
        ),
      },
    ]
  );
}

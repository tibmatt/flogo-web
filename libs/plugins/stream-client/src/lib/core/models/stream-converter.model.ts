import { isUndefined, uniqueId, fromPairs, pick } from 'lodash';
import { Injectable } from '@angular/core';

import {
  Dictionary,
  ContributionsService,
  ErrorService,
  FLOGO_CONTRIB_TYPE,
} from '@flogo-web/lib-client/core';
import {
  Resource,
  ValueType,
  TriggerSchema,
  ActivitySchema,
  FunctionsSchema,
  Metadata,
  MetadataAttribute,
} from '@flogo-web/core';
import { makeGraphAndItems } from './graph-and-items';
import { ItemFactory } from './graph-and-items/item-factory';

interface FlowInfo {
  id: string;
  appId: string;
  name: string;
  description: string;
  app: any;
  metadata?: Metadata;
}

@Injectable()
export class StreamConverterModel {
  subflowSchemaRegistry: Dictionary<Resource>;

  constructor(
    private contribService: ContributionsService,
    private errorService: ErrorService
  ) {}

  getFlowInformation(resource): FlowInfo {
    const flowInputs = (resource.metadata && resource.metadata.input) || [];
    const flowOutputs = (resource.metadata && resource.metadata.output) || [];
    const metadata: Metadata = {
      input: [],
      output: [],
    };

    metadata.input = flowInputs.map(input => {
      const inputMetadata: MetadataAttribute = {
        name: input.name,
        type: (input.type as ValueType) || ValueType.String,
      };
      if (!isUndefined(input.value)) {
        inputMetadata.value = input.value;
      }
      return inputMetadata;
    });
    metadata.output = flowOutputs.map(input => ({
      name: input.name,
      type: (input.type as ValueType) || ValueType.String,
    }));

    return {
      id: resource.id,
      appId: resource.app.id,
      name: resource.name || resource.id,
      description: resource.description || '',
      app: resource.app,
      metadata,
    };
  }

  getTriggerSchema(trigger) {
    if (!trigger.ref) {
      throw this.errorService.makeOperationalError(
        'Trigger: Wrong input json file',
        'Cannot get ref for trigger',
        {
          type: 'ValidationError',
          title: 'Wrong input json file',
          detail: 'Cannot get ref for trigger:',
          property: 'trigger',
          value: trigger,
        }
      );
    } else {
      return this.contribService
        .getContributionDetails(trigger.ref)
        .then((schema: TriggerSchema) => this.normalizeTriggerSchema(schema));
    }
  }

  convertToWebFlowModel(resource, subflowSchema: Dictionary<Resource>) {
    this.subflowSchemaRegistry = subflowSchema;
    this.verifyHasProperTasks(resource);
    return Promise.all([this.getAllActivitySchemas(), this.getAllFunctionSchemas()]).then(
      ([allActivitySchemas, allFunctionSchemas]) => {
        return this.processFlowObj(resource, [
          ...allActivitySchemas,
          ...allFunctionSchemas,
        ]);
      }
    );
  }

  verifyHasProperTasks(flow) {
    const flowData = flow && flow.data;
    let tasks = (flowData && flowData.tasks) || [];
    // add tiles from error diagram
    tasks = tasks.concat(
      (flowData && flowData.errorHandler && flowData.errorHandler.tasks) || []
    );
    // filter only tasks of type activity and ignore subflows
    tasks = tasks.filter(t => t.type !== 4);

    tasks.forEach(task => {
      const ref = task.activityRef;
      if (!ref) {
        throw this.errorService.makeOperationalError(
          'Activity: Wrong input json file',
          `Cannot get activityRef for task: ${task.name}`,
          {
            type: 'ValidationError',
            title: 'Wrong input json file',
            detail: 'Cannot get activityRef for task:',
            property: 'task',
            value: task,
          }
        );
      }
    });
  }

  processFlowObj(resource, installedContribs) {
    const flowInfo = this.getFlowInformation(resource);

    const resourceData = resource && resource.data;
    const tasks = (resourceData && resourceData.tasks) || [];
    const links = (resourceData && resourceData.links) || [];
    const branchIdGenerator = () => uniqueId('::branch::');

    const mainComponents = makeGraphAndItems(
      tasks,
      links,
      installedContribs,
      branchIdGenerator
    );
    const errorHandler = resourceData && resourceData.errorHandler;
    const errorHandlerTasks = (errorHandler && errorHandler.tasks) || [];
    const errorHandlerLinks = (errorHandler && errorHandler.links) || [];
    const errorHandlerComponents = makeGraphAndItems(
      errorHandlerTasks,
      errorHandlerLinks,
      installedContribs,
      branchIdGenerator
    );

    return {
      ...this.makeFlow(flowInfo, installedContribs),
      mainItems: this.cleanDanglingSubflowMappings(mainComponents.items),
      mainGraph: mainComponents.graph,
      errorItems: this.cleanDanglingSubflowMappings(errorHandlerComponents.items),
      errorGraph: errorHandlerComponents.graph,
    };
  }

  makeFlow(flowInfo: FlowInfo, schemas = []) {
    const { id, name, description, appId, app, metadata } = flowInfo;

    const flow: any = {
      id,
      name,
      description,
      appId,
      app,
      mainItems: null,
      errorItems: null,
      mainGraph: null,
      errorGraph: null,
      schemas: fromPairs(schemas.map(schema => [schema.ref, schema])),
    };

    if (metadata) {
      flow.metadata = metadata;
    }
    return flow;
  }

  makeTriggerTask(trigger, installedTrigger) {
    const nodeTrigger = NodeFactory.makeTrigger();
    const itemTrigger = ItemFactory.makeTrigger({
      node: nodeTrigger,
      cli: trigger,
      installed: installedTrigger,
      handlerSetting: trigger.handler,
    });
    itemTrigger.name = trigger.name;
    itemTrigger.description = trigger.description;
    itemTrigger.outputs.forEach(o => {
      if (trigger.handler.outputs[o.name]) {
        o.value = trigger.handler.outputs[o.name];
      }
    });

    return itemTrigger;
  }

  private getAllActivitySchemas(): Promise<ActivitySchema[]> {
    return this.contribService.listContribs<ActivitySchema>(FLOGO_CONTRIB_TYPE.ACTIVITY);
  }

  private getAllFunctionSchemas(): Promise<FunctionsSchema[]> {
    return this.contribService.listContribs<FunctionsSchema>(FLOGO_CONTRIB_TYPE.FUNCTION);
  }

  private cleanDanglingSubflowMappings(items: Dictionary<any>) {
    const subflowInputExists = (subflowInputs, propName) =>
      !!subflowInputs.find(i => i.name === propName);
    Object.values(items).forEach(item => {
      if (!this.isSubflowItem(item) || !item.inputMappings) {
        return;
      }
      // If the flow is still available get the inputs of a subflow from its latest definition
      // else consider an empty array as flow inputs.
      const subflowSchema = this.subflowSchemaRegistry[item.settings.flowPath];
      const subflowInputs =
        (subflowSchema && subflowSchema.metadata && subflowSchema.metadata.input) || [];
      // Remove the dangling inputMappings of old flow inputs. This won't save to the database yet
      // but it will make sure it won't maintain the dangling mappings when next time flow is saved.
      const filteredInputMappings = subflowInputs.map(input => input.name);
      item.inputMappings = pick(item.inputMappings, filteredInputMappings);
    });
    return items;
  }

  private isSubflowItem(item) {
    return item.type === 4;
  }

  private normalizeTriggerSchema(schema: TriggerSchema): TriggerSchema {
    if (!schema.handler) {
      schema.handler = {
        settings: [],
      };
    }
    return schema;
  }
}

class NodeFactory {
  static makeTrigger() {
    return Object.assign({}, this.getSharedProperties(), {
      type: 3,
      taskID: `Flogo::Trigger::${Date.now()}`,
    });
  }

  static makeItem(item) {
    return Object.assign({}, this.getSharedProperties(), {
      type: 5,
      taskID: item.taskID,
    });
  }

  static getSharedProperties() {
    const status = { isSelected: false };
    return Object.assign(
      {},
      {
        id: uniqueId(`FlogoFlowDiagramNode::${Date.now()}::`),
        __status: status,
        children: [],
        parents: [],
      }
    );
  }

  static makeBranch() {
    return Object.assign({}, this.getSharedProperties(), {
      type: 6,
      taskID: NodeFactory.flogoGenBranchID(),
    });
  }

  static flogoGenBranchID() {
    return uniqueId(`Flogo::Branch::${Date.now()}::`);
  }
}

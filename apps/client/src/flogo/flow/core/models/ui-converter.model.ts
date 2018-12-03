import { get, fromPairs, uniqueId } from 'lodash';
import {
  ActionBase,
  FlowMetadata,
  FLOGO_PROFILE_TYPE,
  FLOGO_FLOW_DIAGRAM_NODE_TYPE,
  UiFlow,
  Dictionary,
  Item,
  ItemSubflow,
  TriggerSchema,
  FLOGO_CONTRIB_TYPE,
  ActivitySchema,
} from '@flogo-web/client/core';
import { ErrorService } from '@flogo-web/client/core/services/error.service';
import { RESTAPIContributionsService } from '@flogo-web/client/core/services/restapi/v2/contributions.service';
import { flogoGenTriggerID, flogoGenNodeID, isSubflowTask } from '@flogo-web/client/shared/utils';

import { ItemFactory } from './graph-and-items/item-factory';
import { makeGraphAndItems } from './graph-and-items';

export interface FlowInfo {
  id: string;
  appId: string;
  name: string;
  description: string;
  app: any;
  metadata?: FlowMetadata;
}

export abstract class AbstractModelConverter {
  subflowSchemaRegistry: Dictionary<ActionBase>;
  errorService: ErrorService;
  contribService: RESTAPIContributionsService;

  constructor(contributionService: RESTAPIContributionsService, errorService: ErrorService) {
    this.contribService = contributionService;
    this.errorService = errorService;
  }

  abstract getProfileType(): FLOGO_PROFILE_TYPE;

  abstract getFlowInformation(flow): FlowInfo;

  abstract normalizeActivitySchema(schema: ActivitySchema): ActivitySchema;

  getTriggerSchema(trigger) {
    if (!trigger.ref) {
      throw this.errorService.makeOperationalError('Trigger: Wrong input json file', 'Cannot get ref for trigger', {
        type: 'ValidationError',
        title: 'Wrong input json file',
        detail: 'Cannot get ref for trigger:',
        property: 'trigger',
        value: trigger,
      });
    } else {
      return this.contribService
        .getContributionDetails(this.getProfileType(), trigger.ref)
        .then((schema: TriggerSchema) => this.normalizeTriggerSchema(schema));
    }
  }

  convertToWebFlowModel(flowObj, subflowSchema: Dictionary<ActionBase>) {
    this.subflowSchemaRegistry = subflowSchema;
    this.hasProperTasks(flowObj);
    return this.getAllActivitySchemas().then(installedActivities => this.processFlowObj(flowObj, installedActivities));
  }

  hasProperTasks(flow: any) {
    let tasks = (flow && flow.tasks) || [];
    // add tiles from error diagram
    tasks = tasks.concat((flow && flow.errorHandler && flow.errorHandler.tasks) || []);
    // filter only tasks of type activity and ignore subflows
    tasks = tasks.filter(t => !isSubflowTask(t.type));

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

  processFlowObj(flowJSON, installedContribs) {
    const flowInfo = this.getFlowInformation(flowJSON);

    // const mainFlowParts = this.getFlowParts(installedContribs, tasks, links);

    const tasks = (flowJSON && flowJSON.tasks) || [];
    const links = (flowJSON && flowJSON.links) || [];
    const branchIdGenerator = () => uniqueId('::branch::');

    const mainComponents = makeGraphAndItems(tasks, links, installedContribs, branchIdGenerator);
    const errorHandlerTasks = (flowJSON && flowJSON.errorHandler && flowJSON.errorHandler.tasks) || [];
    const errorHandlerLinks = (flowJSON && flowJSON.errorHandler && flowJSON.errorHandler.links) || [];
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

  makeFlow(flowInfo: FlowInfo, schemas = []): UiFlow {
    const { id, name, description, appId, app, metadata } = flowInfo;

    const flow: UiFlow = {
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
    return this.contribService
      .listContribs<ActivitySchema>(this.getProfileType(), FLOGO_CONTRIB_TYPE.ACTIVITY)
      .then(activities => activities.map(this.normalizeActivitySchema));
  }

  private cleanDanglingSubflowMappings(items: Dictionary<Item>) {
    const subflowInputExists = (subflowInputs, propName) => !!subflowInputs.find(i => i.name === propName);
    Object.values(items).forEach(item => {
      if (!this.isSubflowItem(item) || !item.inputMappings) {
        return;
      }
      // If the flow is still available get the inputs of a subflow from its latest definition
      // else consider an empty array as flow inputs.
      const subflowSchema = this.subflowSchemaRegistry[item.settings.flowPath];
      const subflowInputs = (subflowSchema && subflowSchema.metadata && subflowSchema.metadata.input) || [];
      // Remove the dangling inputMappings of old flow inputs. This won't save to the database yet
      // but it will make sure it won't maintain the dangling mappings when next time flow is saved.
      item.inputMappings = item.inputMappings.filter(mapping => subflowInputExists(subflowInputs, mapping.mapTo));
    });
    return items;
  }

  private isSubflowItem(item: Item): item is ItemSubflow {
    return isSubflowTask(item.type);
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
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
      taskID: flogoGenTriggerID(),
    });
  }

  static makeItem(item) {
    return Object.assign({}, this.getSharedProperties(), {
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
      taskID: item.taskID,
    });
  }

  static getSharedProperties() {
    const status = { isSelected: false };
    return Object.assign({}, { id: flogoGenNodeID(), __status: status, children: [], parents: [] });
  }

  static makeBranch() {
    return Object.assign({}, this.getSharedProperties(), {
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
      taskID: NodeFactory.flogoGenBranchID(),
    });
  }

  static flogoGenBranchID() {
    return uniqueId(`Flogo::Branch::${Date.now()}::`);
  }
}

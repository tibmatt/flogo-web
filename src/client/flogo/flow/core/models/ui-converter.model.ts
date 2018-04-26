import { get, flattenDeep, uniqueId } from 'lodash';
import {
  ActionBase,
  FlowMetadata,
  FLOGO_PROFILE_TYPE,
  UiFlow, Dictionary, Item, ItemSubflow,
} from '@flogo/core';
import { ErrorService } from '@flogo/core/services/error.service';
import {RESTAPIContributionsService} from '@flogo/core/services/restapi/v2/contributions.service';
import { flogoGenTriggerID, isSubflowTask } from '@flogo/shared/utils';

import { FLOGO_FLOW_DIAGRAM_NODE_TYPE } from '../../shared/diagram/constants';

import { ItemFactory } from './graph-and-items/item-factory';
import { makeGraphAndItems } from './graph-and-items';

import { FlogoFlowDiagramNode } from '../../shared/diagram/models/node.model';

export interface FlowInfo {
  id: string;
  appId: string;
  name: string;
  description: string;
  app: any;
  metadata?: FlowMetadata;
}

export abstract class AbstractModelConverter {
  subflowSchemaRegistry: Map<string, ActionBase>;
  errorService: ErrorService;
  contribService: RESTAPIContributionsService;

  constructor(contributionService: RESTAPIContributionsService, errorService: ErrorService) {
    this.contribService = contributionService;
    this.errorService = errorService;
  }

  abstract getActivitiesSchema(list);

  abstract getProfileType(): FLOGO_PROFILE_TYPE;

  abstract getFlowInformation(flow): FlowInfo;

  getTriggerSchema(trigger) {
    if (!trigger.ref) {
      throw this.errorService.makeOperationalError('Trigger: Wrong input json file', 'Cannot get ref for trigger',
        {
          type: 'ValidationError',
          title: 'Wrong input json file',
          detail: 'Cannot get ref for trigger:',
          property: 'trigger',
          value: trigger
        });
    } else {
      return this.contribService.getContributionDetails(this.getProfileType(), trigger.ref);
    }
  }

  convertToWebFlowModel(flowObj, subflowSchema: Map<string, ActionBase>) {
    this.subflowSchemaRegistry = subflowSchema;
    return this.getActivitiesSchema(this.activitiesUsed(flowObj))
      .then((installedActivities) => {
        const installedTiles = flattenDeep(installedActivities);
        return this.processFlowObj(flowObj, installedTiles);
      });
  }

  activitiesUsed(flow: any) {
    const activitiesList = [];
    let tasks = get(flow, 'data.flow.rootTask.tasks', []);
    // add tiles from error diagram
    tasks = tasks.concat(get(flow, 'data.flow.errorHandlerTask.tasks', []));
    // filter only tasks of type activity and ignore subflows
    tasks = tasks.filter(t => !isSubflowTask(t.type));

    tasks.forEach((task) => {
      const ref = task.activityRef;
      if (!ref) {
        throw this.errorService.makeOperationalError('Activity: Wrong input json file',
          `Cannot get activityRef for task: ${task.name}`,
          {
            type: 'ValidationError',
            title: 'Wrong input json file',
            detail: 'Cannot get activityRef for task:',
            property: 'task',
            value: task
          });
      }
      if (activitiesList.indexOf(ref) === -1) {
        activitiesList.push(ref);
      }
    });

    return activitiesList;
  }

  processFlowObj(flowJSON, installedContribs) {
    const flowData = flowJSON.data.flow;
    const flowInfo = this.getFlowInformation(flowJSON);

    // const mainFlowParts = this.getFlowParts(installedContribs, tasks, links);

    const tasks = get(flowData, 'rootTask.tasks', []);
    const links = get(flowData, 'rootTask.links', []);
    const branchIdGenerator = () => uniqueId('::branch::');

    const mainComponents = makeGraphAndItems(tasks, links, installedContribs, branchIdGenerator);
    const errorHandlerComponents = makeGraphAndItems(
      get(flowData, 'errorHandlerTask.tasks', []),
      get(flowData, 'errorHandlerTask.links', []),
      installedContribs,
      branchIdGenerator,
    );

    return {
      ...this.makeFlow(flowInfo, installedContribs),
      items: this.cleanDanglingSubflowMappings(mainComponents.items),
      mainGraph: mainComponents.graph,
      errorItems: this.cleanDanglingSubflowMappings(errorHandlerComponents.items),
      errorGraph: errorHandlerComponents.graph,
    };
  }

  makeFlow(flowInfo: FlowInfo, schemas?): UiFlow {
    const { id, name, description, appId, app, metadata } = flowInfo;

    const flow: UiFlow = {
      id,
      name,
      description,
      appId,
      app,
      items: null,
      errorItems: null,
      mainGraph: null,
      errorGraph: null,
      schemas: schemas || {}
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
      endpointSetting: trigger.handler
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

  private cleanDanglingSubflowMappings(items: Dictionary<Item>) {
    const subflowInputExists = (subflowInputs, propName) => !!subflowInputs.find(i => i.name === propName);
    Object.values(items).forEach(item => {
      if (!this.isSubflowItem(item) || !item.inputMappings) {
        return;
      }
      // If the flow is still available get the inputs of a subflow from its latest definition
      // else consider an empty array as flow inputs.
      const subflowSchema = this.subflowSchemaRegistry.get(item.settings.flowPath);
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

}

class NodeFactory {
  static makeTrigger() {
    return Object.assign({}, this.getSharedProperties(), {
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT, taskID: flogoGenTriggerID()
    });
  }

  static makeItem(item) {
    return Object.assign({}, this.getSharedProperties(), {
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE, taskID: item.taskID
    });
  }

  static getSharedProperties() {
    const status = { isSelected: false };
    return Object.assign({}, { id: FlogoFlowDiagramNode.genNodeID(), __status: status, children: [], parents: [] });
  }

  static makeBranch() {
    return Object.assign({}, this.getSharedProperties(), {
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH, taskID: NodeFactory.flogoGenBranchID()
    });
  }

  static flogoGenBranchID() {
    return uniqueId(`Flogo::Branch::${Date.now()}::`);
  }
}

import {Injectable} from "@angular/core";
import 'rxjs/add/operator/toPromise';
import {
  FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE,
  FLOGO_FLOW_DIAGRAM_NODE_TYPE
} from "../../flogo.flows.detail.diagram/constants";
import {flogoGenTriggerID, flogoIDEncode} from "../../../common/utils";
import {FLOGO_TASK_ATTRIBUTE_TYPE, FLOGO_TASK_TYPE} from "../../../common/constants";
import {RESTAPITriggersService} from "../../../common/services/restapi/triggers-api.service";
import {RESTAPIActivitiesService} from "../../../common/services/restapi/activities-api.service";
import {FlogoFlowDiagramNode} from "../../flogo.flows.detail.diagram/models/node.model";
import {ErrorService} from "../../../common/services/error.service";
/*
 const APP_FIELDS = [
 'name',
 'type',
 'version',
 'description'
 ];*/

const FLOW_NODE = 'node';
const FLOW_ITEM = 'item';

@Injectable()
export class UIModelConverterService {
  itemIndex = 2;

  constructor(private _triggerService: RESTAPITriggersService,
              private _activityService: RESTAPIActivitiesService,
              private _errorService: ErrorService) {
  }

  /**
   * Convert Engine Flow Model to UI flow model.
   *
   * @example
   * const uiFlowModel = converterService.runFromRoot({
   *   useFlow: { _id: "flows:flogoweb-admin:2017-02-24T18:21:29.014Z", items: { ... }, paths: {...}  },
   *   attrsData: [{"name":"params", "type":"params", "value":{ "id":3 }}]
   * });
   *
   * runner.state.subscribe(...);
   * runner.completed.subscribe(...);
   *
   * @example
   * try {
   *   const runner = runnerService.getWebFlowModel({
   *    engineFlowObj,
   *    flowTriggerObj
   *   });
   * } catch(error) {
   *    **Error Handling**
   * }
   *
   *
   * @param {engineFlowObj} Engine flow model JSON. See mockFlow in ./ui-model-flow.mock.ts
   * @param {flowTriggerObj} Engine trigger JSON. see mockTrigger in ./ui-model-trigger.mock.ts
   * @return {uiFlowObj}
   *
   * getWebFlowModel method can throw the following errors:
   *
   * 1. error.type = "ValidationError" -> Will be thrown with Trigger JSON or Flow JSON. When the trigger or activity
   *                                      does not have a 'ref' key for fetching the details of the trigger or activity.
   *
   * 2. error.type = "notInstalledTrigger" -> Will be thrown when the trigger is not installed in the Engine.
   *
   * 3. error.type = "notInstalledActivity" -> Will be thrown when the activity is not installed in the Engine.
   *
   * 4. error.message = "Function linkTiles:Cannot link trigger with first node"
   *                    -> Will be thrown when there is no Link established between trigger and first node.
   *
   * 5. error.message = "Unable to link branches" -> Will be thrown when the link to a branch is not made properly.
   *
   */

  getWebFlowModel(flowObj: any, triggerObj: any) {
    if(!triggerObj.ref){
      throw this._errorService.makeOperationalError('Trigger: Wrong input json file','Cannot get ref for trigger',
        {
          type: "ValidationError",
          title: 'Wrong input json file',
          detail: 'Cannot get ref for trigger:',
          property: 'trigger',
          value: triggerObj
        });
    } else {
      return Promise.all([this._triggerService.getTriggerDetails(triggerObj.ref), this.getActivities(flowObj)])
        .then((triggersAndActivities) => {
          let installedTiles = _.flattenDeep(triggersAndActivities);
          return this.processFlowObj(flowObj, triggerObj, installedTiles);
        });
    }
  }

  getActivities(activity: any) {
    let promises = [];
    let processed = [];
    let tasks = _.get(activity, 'data.flow.rootTask.tasks', []);
    // add tiles from error diagram
    tasks = tasks.concat(_.get(activity, 'data.flow.errorHandlerTask.tasks', []));

    tasks.forEach((task) => {
      const ref = task.activityRef;
      if (!ref) {
        throw this._errorService.makeOperationalError('Activity: Wrong input json file',
          `Cannot get activityRef for task: ${task.name}`,
          {
            type: "ValidationError",
            title: 'Wrong input json file',
            detail: 'Cannot get activityRef for task:',
            property: 'task',
            value: task
          });
      }
      if (processed.indexOf(ref) == -1) {
        processed.push(ref);
        promises.push(this._activityService.getActivityDetails(ref));
      }
    });

    return Promise.all(promises);
  }

  processFlowObj(flowJSON, triggerJSON, installedTiles) {
    let endpoints = _.get(triggerJSON, 'handlers', []);
    // task flows
    let tasks = _.get(flowJSON, 'data.flow.rootTask.tasks', []);
    // links tasks
    let links = _.get(flowJSON, 'data.flow.rootTask.links', []);

    let flowInfo = {
      appId: flowJSON.app.id,
      name: flowJSON.name || flowJSON.id,
      description: flowJSON.description || '',
      app: flowJSON.app
    };

    let mainFlowParts = this.getFlowParts(triggerJSON, tasks, links, installedTiles, endpoints[0]);
    let currentFlow = this.makeFlow(mainFlowParts, flowInfo, installedTiles);


    if(flowJSON.data.flow.errorHandlerTask){
      // task flows of error handler
      tasks = _.get(flowJSON, 'data.flow.errorHandlerTask.tasks', []);
      // links tasks of error handler
      links = _.get(flowJSON, 'data.flow.errorHandlerTask.links', []);
      const errorFlowParts = this.getFlowParts(null, tasks, links, installedTiles, endpoints[0]);

      currentFlow.errorHandler = this.makeFlow(errorFlowParts, flowInfo);
    }
    return currentFlow;
  }


  makeFlow(parts, flowInfo, installedTiles?) {
    let flow: any = {};
    try {
      let {nodes, items, branches} = parts;
      let {name, description, appId, app} = flowInfo;

      let nodeTrigger = nodes.find((element) => {
        let nodeType = element.node.type;
        return nodeType === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT || nodeType === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_ERROR_NEW;
      });

      flow = {
        name,
        description,
        appId,
        app,
        paths: {
          root: {
            is: nodeTrigger.node.id,
          },
          nodes: {},
        },
        items: {},
      };

      if(installedTiles) {
        flow.schemas = {};
      }

      nodes.concat(branches).forEach((element) => {
        flow.paths.nodes[element.node.id] = element.node;
      });

      items.forEach((element) => {
        element.node.name = _.get(element, 'cli.name', element.node.name);
        element.node.description = _.get(element, 'cli.description', element.node.description);
        flow.items[element.node.id || element.node.nodeId] = element.node;
        if(installedTiles) {
          flow.schemas[element.node.ref] =  installedTiles.find((tile) => {
            return tile.ref === element.node.ref;
          });
        }
      });
    } catch (error) {
      console.error('Error function makeFlow:', error);
      throw error;
    }
    return flow;
  }

  getFlowParts(trigger, tasks, links, installedTiles, endpointSetting) {
    let nodes = [];
    let items = [];
    let branches = [];
    let node = new FlowElement(FLOW_NODE);
    let item = new FlowElement(FLOW_ITEM);

    try {
      let rootTrigger = trigger || { isErrorTrigger: true, taskID: flogoIDEncode(`${this.itemIndex}`), cli: { id: -1 } };
      if(rootTrigger.isErrorTrigger){
        this.itemIndex += 1;
      }
      let nodeTrigger = node.makeTrigger(rootTrigger);

      let installedTrigger = installedTiles.find(tile => trigger && tile.ref === trigger.ref);
      if (trigger && !installedTrigger) {
        throw this._errorService.makeOperationalError('Trigger is not installed', `Trigger: ${trigger.ref}`,
          {
            type: 'notInstalledTrigger',
            title: 'Trigger is not installed',
            detail: `Trigger: ${trigger.ref}`,
            property: 'trigger',
            value: trigger
          });
      }

      let itemTrigger = item.makeTrigger(trigger ? { node: nodeTrigger, cli: rootTrigger, installed: installedTrigger, endpointSetting } : rootTrigger);
      nodes.push({ node: nodeTrigger, cli: rootTrigger });
      items.push({ node: itemTrigger, cli: rootTrigger });

      tasks.forEach((task) => {
        let nodeItem = node.makeItem({ taskID: flogoIDEncode(`${this.itemIndex}`) });
        this.itemIndex += 1;

        let installedActivity = installedTiles.find(tile => tile.ref === task.activityRef);
        if (!installedActivity) {
          throw this._errorService.makeOperationalError('Activity is not installed', `Activity: ${task.activityRef}`,
            {
              type: 'notInstalledActivity',
              title: 'Activity is not installed',
              detail: `Activity: ${task.activityRef}`,
              property: 'task',
              value: task
            });
        }
        let itemActivity = item.makeItem({ node: nodeItem, cli: task, installed: installedActivity });

        nodes.push({ node: nodeItem, cli: task });
        items.push({ node: itemActivity, cli: task });
      });

      // add branches
      links.forEach((link) => {
        if (link.type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH) {
          let branchNode = node.makeBranch();
          let branchItem = item.makeBranch({ taskID: branchNode.taskID, condition: link.value });
          // get connectors points
          let nodeFrom = nodes.find(result => result.cli.id === link.from);
          let nodeTo = nodes.find(result => result.cli.id === link.to);

          branches.push({ node: branchNode, connector: { from: nodeFrom.cli.id, to: nodeTo.cli.id } });
          items.push({ node: branchItem, cli: null, connector: null });
        }
      });


      let nodeLinks = links.filter(link => link.type !== FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH);
      let branchesLinks = links.filter(link => link.type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH);
      linkTiles(nodes, nodeLinks, nodeTrigger);

      linkBranches(branches, nodes, branchesLinks);
    } catch (error) {
      console.error('Function getFlowParts:', error);
      throw error;
    }

    return { nodes, items, branches };

    function linkTiles(nodes, links, nodeTrigger) {
      try {
        links.forEach((link) => {
          const from = nodes.find(result => result.cli.id === link.from);
          const to = nodes.find(result => result.cli.id === link.to);
          linkNodes(from.node, to.node);
        });

        // set link between trigger and first node
        const orphanNode = nodes.find(result => result.node && result.node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE && result.node.parents.length === 0);

        if (orphanNode) {
          linkNodes(nodeTrigger, orphanNode.node);
        } else if (links.length) {
          throw new Error('Function linkTiles:Cannot link trigger with first node');
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    function linkBranches(branches, nodes, links) {
      try {
        links.forEach((link) => {
          const branch = branches.find(branch => branch.connector.from === link.from && branch.connector.to === link.to);
          const nodeFrom = nodes.find(node => node.cli.id === link.from);
          const nodeTo = nodes.find(node => node.cli.id === link.to);

          if (branch && nodeFrom && nodeTo) {
            linkNodes(nodeFrom.node, branch.node);
            linkNodes(branch.node, nodeTo.node);
          } else {
            throw new Error('Unable to link branches');
          }
        });
      } catch (error) {
        console.error('Error function linkBranches:', error);
        throw error;
      }
    }

    function linkNodes(parent, child) {
      try {
        parent.children.push(child.id);
        child.parents.push(parent.id);
      } catch (error) {
        console.error('Function linkNodes:', error);
        throw error;
      }
    }
  }

}

class FlowElement {
  factory: any;
  constructor(factoryName) {
    switch (factoryName) {
      case FLOW_NODE:
        this.factory = NodeFactory;
        break;

      case FLOW_ITEM:
        this.factory = ItemFactory;
        break;

      default:
        throw new Error('Wrong factory Name in class FlowElement');
    }
  }

  makeTrigger(trigger) {
    return this.factory.makeTrigger(trigger);
  }

  makeItem(item) {
    return this.factory.makeItem(item);
  }

  makeBranch(branch?) {
    return this.factory.makeBranch(branch);
  }

}

class NodeFactory {
  static makeTrigger(trigger) {
    if (trigger.isErrorTrigger) {
      return Object.assign({}, this.getSharedProperties(), {
        type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_ERROR_NEW, taskID: trigger.taskID
      });
    } else {
      return Object.assign({}, this.getSharedProperties(), {
        type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT, taskID: flogoGenTriggerID()
      });
    }
  }

  static makeItem(item) {
    return Object.assign({}, this.getSharedProperties(), {
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE, taskID: item.taskID
    });
  }

  static getSharedProperties() {
    let status = {isSelected: false};
    return Object.assign({}, {id: FlogoFlowDiagramNode.genNodeID(), __status: status, children: [], parents: []});
  }

  static makeBranch() {
    return Object.assign({}, this.getSharedProperties(), {
      type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH, taskID: NodeFactory.flogoGenBranchID()
    });
  }

  static flogoGenBranchID() {
    let id = '';

    if ( performance && _.isFunction( performance.now ) ) {
      id = `Flogo::Branch::${Date.now()}::${performance.now()}`;
    } else {
      id = `Flogo::Branch::${Date.now()}`;
    }
    return flogoIDEncode( id );
  }
}

class ItemFactory {

  static getSharedProperties(installed) {
    let defaults = {
      name: '',
      title: '',
      version: '',
      homepage: '',
      description: '',
      installed: true,
      settings: [],
      outputs: [],
      ref: '',
      endpoint: {settings: []},
      __props: {
        errors: [],
      },
      __status: {}
    };
    let item = Object.assign({}, defaults, _.pick(installed, ['name', 'title', 'version', 'homepage', 'description', 'ref']));
    return item;
  }

  static makeTriggerError(trigger) {
    return {
      id: trigger.taskID,
      type: FLOGO_TASK_TYPE.TASK_ROOT,
      version: '',
      name: 'On Error',
      description: '',
      title: 'On Error',
      activityType: '',
      triggerType: '__error-trigger',
      attributes: {
        outputs: [{
          name: 'activity', type: FLOGO_TASK_ATTRIBUTE_TYPE.STRING, title: 'activity', value: '',
        }, {
          name: 'message', type: FLOGO_TASK_ATTRIBUTE_TYPE.STRING, title: 'message', value: '',
        }, {
          name: 'data', type: FLOGO_TASK_ATTRIBUTE_TYPE.ANY, title: 'data', value: '',
        },],
      },
      inputMappings: [],
      outputMappings: [],
      outputs: [{
        name: 'activity', type: FLOGO_TASK_ATTRIBUTE_TYPE.STRING, title: 'activity', value: '',
      }, {
        name: 'message', type: FLOGO_TASK_ATTRIBUTE_TYPE.STRING, title: 'message', value: '',
      }, {
        name: 'data', type: FLOGO_TASK_ATTRIBUTE_TYPE.ANY, title: 'data', value: '',
      },],
      __props: {
        errors: [],
      },
      __status: {},
    };
  }

  static makeTrigger(trigger): any {
    if (trigger.isErrorTrigger) {
      return this.makeTriggerError(trigger);
    }

    let {installed, cli, endpointSetting} = trigger;
    let item = Object.assign({}, this.getSharedProperties(installed), {id: trigger.node.taskID}, {
      nodeId: trigger.node.taskID, type: FLOGO_TASK_TYPE.TASK_ROOT, triggerType: installed.name
    });

    let settings = _.get(cli, 'settings', {});
    // get settings
    let installedSettings = new Map(installed.settings.map(s => [s.name, s]));
    Object.keys(settings).forEach((property) => {
      // TODO: if no schema?
      let schema: any = installedSettings.get(property);
      let newSetting: any = {
        name: property, type: schema.type, value: settings[property],
      };
      if (schema.required) {
        newSetting.required = true;
      }
      item.settings.push(newSetting);
    });

    let endpointSettings = _.get(installed, 'endpoint.settings', []);
    let installedEndpointSettings = new Map(endpointSettings.map<[string, any]>(s => [s.name, s]));
    Object.keys(endpointSetting.settings || {}).forEach((property) => {
      let schema: any = installedEndpointSettings.get(property);

      // TODO: if no schema?
      let newEndpointSetting: any = {
        name: property, type: schema.type, value: endpointSetting.settings[property],
      };
      if (schema.required) {
        newEndpointSetting.required = true;
      }

      if (schema.allowed) {
        newEndpointSetting.allowed = schema.allowed;
      }
      item.endpoint.settings.push(newEndpointSetting);
    });


    //-----------------
    // set outputs
    let outputs = installed.outputs || [];

    item.outputs = outputs.map(output => ({
      name: output.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(output, 'type', 'STRING').toUpperCase()],
    }));


    return item;
  }

  static makeItem(activity): any {
    let {node, installed, cli} = activity;

    let item = Object.assign({}, this.getSharedProperties(installed), {
      attributes: {
        inputs: [], outputs: []
      }
    }, {inputMappings: cli.inputMappings || []}, {
      id: node.taskID, type: FLOGO_TASK_TYPE.TASK, activityType: installed.id
    });

    // -------- set attributes inputs  ----------------
    let installedInputs = installed.inputs || [];
    let cliAttributes = cli.attributes || [];

    installedInputs.forEach((installedInput) => {
      let cliValue = cliAttributes.find(attribute => attribute.name === installedInput.name);

      let newAttribute: any = {
        name: installedInput.name,
        type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(installedInput, 'type', 'STRING').toUpperCase()],
      };

      if (cliValue) {
        newAttribute.value = cliValue.value;
      } else {
        // use the value provided by the schema
        newAttribute.value = installedInput.value;
      }

      item.attributes.inputs.push(newAttribute);
    });

    //-----------------
    // set attributes outputs
    let outputs = installed.outputs || [];

    item.attributes.outputs = outputs.map(output => ({
      name: output.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(output, 'type', 'STRING').toUpperCase()],
    }));


    return item;
  }

  static makeBranch(branch) {
    return {
      id: branch.taskID, type: FLOGO_TASK_TYPE.TASK_BRANCH, condition: branch.condition,
    };
  }
}

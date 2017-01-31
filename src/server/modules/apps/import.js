import pick from 'lodash/pick';
import get from 'lodash/get';
import flattenDeep from 'lodash/flattenDeep';


import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { TriggerManager } from './../../modules/triggers/';
import { ActivitiesManager } from './../../modules/activities/';
import { genNodeID, flogoGenTriggerID, flogoGenTaskID, flogoIDEncode } from './../../common/utils';
import { FLOGO_FLOW_DIAGRAM_NODE_TYPE, FLOGO_TASK_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE, FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE } from '../../common/constants';
import { CONSTRAINTS } from '../../common/validation';
import { createFlow } from './../../api/flows';

// TODO use FlowsManager

const FLOW_NODE = 'node';
const FLOW_ITEM = 'item';


// TODO document
export function importFlows(importedFlows) {
  const importApp = new ImportFlows(importedFlows);
  return importApp.import();
}

// TODO document
class ImportFlows {
  constructor(importedFlows) {
    this.sourceFlows = importedFlows;
    this.targetFlow = {};
  }

  import() {
    this.targetFlow.nodes = {};
    let itemIndex = 2;

    return Promise.all([getTriggers(this.sourceFlows), getActivities(this.sourceFlows)])
      .then((triggersAndActivities) => {
        const installedTiles = flattenDeep(triggersAndActivities);
        return makeFlows(this.sourceFlows, installedTiles);
      })
      .then(flows => Promise.all(flows.map(flow => createFlow(flow))))
      .then(() => ({ createdApp: this.sourceFlows.createdApp }));


    function makeFlows(flows, installedTiles) {

      const actions = flows.actions || [];
      const resultFlows = [];

      flows.triggers.forEach((trigger) => {
        const endpoints = get(trigger, 'handlers', []);
        // make the flows for this trigger
        endpoints.forEach((endpoint) => {
          // get the flow
          const flowActions = actions.find(action => action.id === endpoint.actionId);
          // task flows
          let tasks = get(flowActions, 'data.flow.rootTask.tasks', []);
          // links tasks
          let links = get(flowActions, 'data.flow.rootTask.links', []);

          const flowInfo = {
            appId: flows.createdApp.id,
            name: flowActions.name || flowActions.id,
            description: flowActions.description || '',
          };

          const mainFlowParts = getFlowParts(trigger, tasks, links, installedTiles, endpoint);
          const currentFlow = makeFlow(mainFlowParts, flowInfo);


          // task flows of error handler
          tasks = get(flowActions, 'data.flow.errorHandlerTask.tasks', []);
          // links tasks of error handler
          links = get(flowActions, 'data.flow.errorHandlerTask.links', []);
          const errorFlowParts = getFlowParts(null, tasks, links, installedTiles, endpoint);

          currentFlow.errorHandler = makeFlow(errorFlowParts, flowInfo);

          resultFlows.push(currentFlow);
        }); // iterate over endpoints
      }); // iterate over triggers
      return Promise.resolve(resultFlows);
    }

    function makeFlow(parts, flowInfo) {
      let flow = {};
      try {
        const { nodes, items, branches } = parts;
        const { name, description, appId } = flowInfo;

        const nodeTrigger = nodes.find((element) => {
          const nodeType = element.node.type;
          return nodeType === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT || nodeType === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_ERROR_NEW;
        });

        flow = {
          name,
          description,
          appId,
          paths: {
            root: {
              is: nodeTrigger.node.id,
            },
            nodes: {},
          },
          items: {},
        };

        nodes.concat(branches).forEach((element) => {
          flow.paths.nodes[element.node.id] = element.node;
        });

        items.forEach((element) => {
          flow.items[element.node.id || element.node.nodeId] = element.node;
        });
      } catch (error) {
        console.error('Error function makeFlow:', error);
        throw error;
      }

      return flow;
    }

    function getFlowParts(trigger, tasks, links, installedTiles, endpointSetting) {
      let nodes = [];
      let items = [];
      let branches = [];
      const node = new FlowElement(FLOW_NODE);
      const item = new FlowElement(FLOW_ITEM);

      try {
        const rootTrigger = trigger || { isErrorTrigger: true, taskID: flogoIDEncode(`${itemIndex}`), cli: { id: -1 } };
        const nodeTrigger = node.makeTrigger(rootTrigger);

        const installedTrigger = installedTiles.find(tile => trigger && tile.where === trigger.ref);
        if (trigger && !installedTrigger) {
          throw ErrorManager.makeError('Trigger is not installed',
            { type: ERROR_TYPES.COMMON.VALIDATION,
              details: {
                errors: [
                  {
                    title: 'Trigger is not installed',
                    detail: `Trigger: ${trigger.ref}`,
                    property: 'trigger',
                    value: trigger,
                    type: CONSTRAINTS.NOT_INSTALLED_TRIGGER,
                  },
                ],
              } });
        }

        const itemTrigger = item.makeTrigger(trigger ? { node: nodeTrigger, cli: rootTrigger, installed: installedTrigger, endpointSetting } : rootTrigger);
        nodes.push({ node: nodeTrigger, cli: rootTrigger });
        items.push({ node: itemTrigger, cli: rootTrigger });

        tasks.forEach((task) => {
          const nodeItem = node.makeItem({ taskID: flogoIDEncode(`${itemIndex}`) });
          itemIndex += 1;

          const installedActivity = installedTiles.find(tile => tile.where === task.activityRef);
          if (!installedActivity) {
            throw ErrorManager.makeError('Activity is not installed',
              { type: ERROR_TYPES.COMMON.VALIDATION,
                details: {
                  errors: [
                    {
                      title: 'Activity is not installed',
                      detail: `Activity: ${task.activityRef}`,
                      property: 'task',
                      value: task,
                      type: CONSTRAINTS.NOT_INSTALLED_ACTIVITY,
                    },
                  ],
                } });
          }
          const itemActivity = item.makeItem({ node: nodeItem, cli: task, installed: installedActivity });

          nodes.push({ node: nodeItem, cli: task });
          items.push({ node: itemActivity, cli: task });
        });

        // add branches
        links.forEach((link) => {
          if (link.type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH) {
            const branchNode = node.makeBranch();
            const branchItem = item.makeBranch({ taskID: branchNode.taskID, condition: link.value });
            // get connectors points
            const nodeFrom = nodes.find(result => result.cli.id === link.from);
            const nodeTo = nodes.find(result => result.cli.id === link.to);

            branches.push({ node: branchNode, connector: { from: nodeFrom.cli.id, to: nodeTo.cli.id } });
            items.push({ node: branchItem, cli: null, connector: null });
          }
        });

        const nodeLinks = links.filter(link => link.type !== FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH);
        const branchesLinks = links.filter(link => link.type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH);
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


    function getTriggers(flows) {
      const promises = [];
      const triggers = flows.triggers || [];

      const triggersURL = triggers.map((trigger) => {
        if (!trigger.ref) {
          throw ErrorManager.makeError('Wrong input json file',
            { type: ERROR_TYPES.COMMON.VALIDATION,
              details: {
                errors: [
                  {
                    title: 'Wrong input json file',
                    detail: 'Cannot get ref for trigger:',
                    property: 'trigger',
                    value: trigger,
                    type: CONSTRAINTS.WRONG_INPUT_JSON_FILE,
                  },
                ],
              } });
        }

        return trigger.ref;
      });
      triggersURL.forEach(url => promises.push(TriggerManager.find({ whereURL: url })));

      return Promise.all(promises);
    }


    function getActivities(flows) {
      const promises = [];
      const activities = flows.actions || [];
      const processed = [];

      activities.forEach((activity) => {
        let tasks = get(activity, 'data.flow.rootTask.tasks', []);
        // add tiles from error diagram
        tasks = tasks.concat(get(activity, 'data.flow.errorHandlerTask.tasks', []));

        tasks.forEach((task) => {
          const ref = task.activityRef;
          if (!ref) {
            throw ErrorManager.makeError('Wrong input json file',
              { type: ERROR_TYPES.COMMON.VALIDATION,
                details: {
                  errors: [
                    {
                      title: 'Wrong input json file',
                      detail: 'Cannot get activityRef for task:',
                      property: 'task',
                      value: task,
                      type: CONSTRAINTS.WRONG_INPUT_JSON_FILE,
                    },
                  ],
                },
              });
          }

          if (processed.indexOf(ref) == -1) {
            processed.push(ref);
            promises.push(ActivitiesManager.find({ whereURL: ref }));
          }
        });
      });

      return Promise.all(promises);
    }
  }

}

class FlowElement {
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

  makeBranch(branch) {
    return this.factory.makeBranch(branch);
  }

}

class NodeFactory {
  static makeTrigger(trigger) {
    if (trigger.isErrorTrigger) {
      return Object.assign({}, this.getSharedProperties(), { type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_ERROR_NEW, taskID: trigger.taskID });
    } else {
      return Object.assign({}, this.getSharedProperties(), { type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT, taskID: flogoGenTriggerID() });
    }
  }
  static makeItem(item) {
    return Object.assign({}, this.getSharedProperties(), { type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE, taskID: item.taskID });
  }

  static getSharedProperties() {
    const status = { isSelected: false };
    return Object.assign({}, { id: genNodeID(), __status: status, children: [], parents: [] });
  }
  static makeBranch() {
    return Object.assign({}, this.getSharedProperties(), { type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH, taskID: flogoGenTriggerID() });
  }
}

class ItemFactory {

  static getSharedProperties(installed) {
    const defaults = { name: '', title: '', version: '', homepage: '', description: '', installed: true, settings: [], outputs: [], endpoint: { settings: [] } };
    const item = Object.assign({}, defaults, pick(installed, ['name', 'title', 'version', 'homepage', 'description']), { __schema: installed });
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
        outputs: [
          {
            name: 'activity',
            type: FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
            title: 'activity',
            value: '',
          },
          {
            name: 'message',
            type: FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
            title: 'message',
            value: '',
          },
          {
            name: 'data',
            type: FLOGO_TASK_ATTRIBUTE_TYPE.ANY,
            title: 'data',
            value: '',
          },
        ],
      },
      inputMappings: [],
      outputMappings: [],
      outputs: [
        {
          name: 'activity',
          type: FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
          title: 'activity',
          value: '',
        },
        {
          name: 'message',
          type: FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
          title: 'message',
          value: '',
        },
        {
          name: 'data',
          type: FLOGO_TASK_ATTRIBUTE_TYPE.ANY,
          title: 'data',
          value: '',
        },
      ],
      __props: {
        errors: [],
      },
      __status: {},
    };
  }

  static makeTrigger(trigger) {
    if (trigger.isErrorTrigger) {
      return this.makeTriggerError(trigger);
    }

    const { installed, cli, endpointSetting } = trigger;
    const item = Object.assign({},
      this.getSharedProperties(installed),
      { id: trigger.node.taskID },
      { nodeId: trigger.node.taskID, type: FLOGO_TASK_TYPE.TASK_ROOT, triggerType: installed.name });

    const settings = get(cli, 'settings', {});
    // get settings
    const installedSettings = new Map(installed.settings.map(s => [s.name, s]));
    Object.keys(settings).forEach((property) => {
      // TODO: if no schema?
      const schema = installedSettings.get(property);
      const newSetting = {
        name: property,
        type: schema.type,
        value: settings[property],
      };
      if (schema.required) {
        newSetting.required = true;
      }
      item.settings.push(newSetting);
    });

    const endpointSettings = get(installed, 'endpoint.settings', {});
    const installedEndpointSettings = new Map(endpointSettings.map(s => [s.name, s]));
    Object.keys(endpointSetting.settings || {}).forEach((property) => {
      const schema = installedEndpointSettings.get(property);

      // TODO: if no schema?
      const newEndpointSetting = {
        name: property,
        type: schema.type,
        value: endpointSetting.settings[property],
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
    const outputs = installed.outputs || [];

    item.outputs = outputs.map(output => ({
      name: output.name,
      type: FLOGO_TASK_ATTRIBUTE_TYPE[get(output, 'type', 'STRING').toUpperCase()],
    }));


    return item;
  }

  static makeItem(activity) {
    const { node, installed, cli } = activity;

    const item = Object.assign({}, this.getSharedProperties(installed),
      { attributes: { inputs: [], outputs: [] } },
      { inputMappings: cli.inputMappings || [] },
      { id: node.taskID, type: FLOGO_TASK_TYPE.TASK, activityType: installed.id });

    // -------- set attributes inputs  ----------------
    const installedInputs = installed.inputs || [];
    const cliAttributes = cli.attributes || [];

    installedInputs.forEach((installedInput) => {
      const cliValue = cliAttributes.find(attribute => attribute.name === installedInput.name);

      const newAttribute = {
        name: installedInput.name,
        type: FLOGO_TASK_ATTRIBUTE_TYPE[get(installedInput, 'type', 'STRING').toUpperCase()],
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
    const outputs = installed.outputs || [];

    item.attributes.outputs = outputs.map(output => ({
      name: output.name,
      type: FLOGO_TASK_ATTRIBUTE_TYPE[get(output, 'type', 'STRING').toUpperCase()],
    }));


    return item;
  }

  static makeBranch(branch) {
    return {
      id: branch.taskID,
      type: FLOGO_TASK_TYPE.TASK_BRANCH,
      condition: branch.condition,
    };
  }
}


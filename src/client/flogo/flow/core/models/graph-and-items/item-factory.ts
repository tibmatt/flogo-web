import { get, cloneDeep, fromPairs, isArray, pick } from 'lodash';
import { ItemActivityTask, ItemBranch, ItemTask } from '../../../../core/index';
import { FLOGO_TASK_TYPE, ValueType } from '../../../../core/constants';

export class ItemFactory {

  static getDefaultTaskProperties(installed) {
    const defaults = {
      name: '',
      description: '',
      settings: {},
      ref: '',
      __props: {
        errors: [],
      },
      __status: {}
    };
    return Object.assign({}, defaults, pick(installed, ['name', 'description', 'ref']));
  }

  static getDefaultTriggerProperties(installed) {
    const defaults = {
      name: '',
      version: '',
      homepage: '',
      description: '',
      installed: true,
      settings: {},
      outputs: [],
      ref: '',
      endpoint: { settings: [] },
      __props: {
        errors: [],
      },
      __status: {}
    };
    return Object.assign({}, defaults, pick(installed, ['name', 'version', 'homepage', 'description', 'ref']));
  }

  static makeTrigger(trigger): any {
    // todo: what does cli means in this context??
    const { installed, cli, endpointSetting } = trigger;
    const item = Object.assign({}, this.getDefaultTriggerProperties(installed), { id: trigger.node.taskID }, {
      nodeId: trigger.node.taskID, type: FLOGO_TASK_TYPE.TASK_ROOT, triggerType: installed.name, settings: [],
    });

    const settings = get(cli, 'settings', {});
    const triggerSchemaSettings = isArray(installed.settings) ? installed.settings : [];
    item.settings = mergeAttributesWithSchema(settings, triggerSchemaSettings);

    const endpointSettings = get(installed, 'endpoint.settings', []);
    item.endpoint.settings = mergeAttributesWithSchema(endpointSetting.settings || {}, endpointSettings);

    const mapType = prop => ({
      name: prop.name,
      type: prop.type || ValueType.String,
    });
    // -----------------
    // set outputs
    const outputs = installed.outputs || [];
    item.outputs = outputs.map(mapType);

    const reply = installed.reply || [];
    item['reply'] = reply.map(mapType);

    return item;
  }

  static makeItem(activitySource: {activitySchema, taskInstance}): ItemTask {
    const { activitySchema, taskInstance } = activitySource;

    const attributes = taskInstance.attributes || [];

    const item: ItemActivityTask = {
      ...this.getDefaultTaskProperties(activitySchema),
      inputMappings: taskInstance.inputMappings || [],
      id: taskInstance.id,
      type: FLOGO_TASK_TYPE[taskInstance.type] ? FLOGO_TASK_TYPE[FLOGO_TASK_TYPE[taskInstance.type]] : FLOGO_TASK_TYPE.TASK,
      settings: taskInstance.settings || {},
      return: !!activitySchema.return,
      input: fromPairs(attributes.map(attr => [attr.name, attr.value])),
    };
    return item;
  }

  static makeBranch(branch): ItemBranch {
    return {
      id: branch.taskID, type: FLOGO_TASK_TYPE.TASK_BRANCH, condition: branch.condition,
    };
  }
}

function mergeAttributesWithSchema(properties: { [key: string]: any }, schemaAttributes: any[]) {
  return schemaAttributes.map(attribute => {
    const mappedAttribute = cloneDeep(attribute);
    if (properties[attribute.name]) {
      mappedAttribute.value = properties[attribute.name];
    }
    return mappedAttribute;
  });
}

import { DEFAULT_VALUES_OF_TYPES, FLOGO_TASK_ATTRIBUTE_TYPE, FLOGO_TASK_TYPE } from '../core/constants';
import {FLOGO_PROFILE_TYPE} from '@flogo/core/constants';

// URL safe base64 encoding
// reference: https://gist.github.com/jhurliman/1250118
export function flogoIDEncode(id: string): string {
  return btoa(id)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// URL safe base64 decoding
// reference: https://gist.github.com/jhurliman/1250118
export function flogoIDDecode(encodedId: string): string {

  encodedId = encodedId.replace(/-/g, '+')
    .replace(/_/g, '/');

  while (encodedId.length % 4) {
    encodedId += '=';
  }

  return atob(encodedId);
}

export function flogoGenBranchID(): string {
  return flogoIDEncode(`Flogo::Branch::${Date.now()}`);
}

export function flogoGenTriggerID(): string {
  return flogoIDEncode(`Flogo::Trigger::${Date.now()}`);
}

/**
 * Convert task ID to integer, which is the currently supported type in engine
 * TODO
 *  taskID should be string in the future, perhaps..
 *
 * @param taskID
 * @returns {number}
 * @private
 */
export function convertTaskID(taskID: string) {
  let id: any = '';

  try {
    id = flogoIDDecode(taskID);

    // get the timestamp
    const parsedID = id.split('::');

    if (parsedID.length >= 2) {
      id = parsedID[1];
    }
  } catch (e) {
    console.warn(e);
    id = taskID;
  }
  id = parseInt(id, undefined) || id;
  return id;
}

// get default value of a given type
export function getDefaultValue(type: FLOGO_TASK_ATTRIBUTE_TYPE): any {
  return DEFAULT_VALUES_OF_TYPES[type];
}

// convert the type of attribute and add default value if enabled
function portAttribute(inAttr: {
  type: string;
  value: any;
  [key: string]: any;
}, withDefault = false) {

  const outAttr = <{
    type: any;
    value: any;
    [key: string]: any;
  }>_.assign({}, inAttr);

  outAttr.type = <FLOGO_TASK_ATTRIBUTE_TYPE>_.get(FLOGO_TASK_ATTRIBUTE_TYPE,
    _.get(outAttr, 'type', 'STRING')
      .toUpperCase());

  if (withDefault && _.isUndefined(outAttr.value)) {
    outAttr.value = getDefaultValue(outAttr.type);
  }

  return outAttr;
}

// todo: add schema
/**
 * Finds out if an activity schema represents a mapper activity.
 * To be considered a mapper activity the schema should have at least one input property that declares
 * a display.mapper propert as true.
 * @example
 *  {
 *    input: [ {
 *      name: "prop",
 *      type: "array",
 *      "display": {
 *           "description": "Return Mapping",
 *           "name": "Mapper",
 *           "type": "mapper",
 *           "mapper_output_scope" : "action.ouput"
 *         }
 *      } ]
 *  }
 * @param activitySchema
 * @return {boolean}
 */
export function isMapperActivity(activitySchema: any) {
  const hasOutputMapperDefinition = _.get(activitySchema, 'inputs', []).find(isOutputMapper);
  return Boolean(hasOutputMapperDefinition);

  function isOutputMapper(inputDefinition) {
    if (_.isObject(inputDefinition.display)) {
      return inputDefinition.display.type === 'mapper';
    }
    return false;
  };
}

// mapping from schema.json of activity to the task can be used in flow.json
export function activitySchemaToTask(schema: any): any {

  const task: any = {
    type: FLOGO_TASK_TYPE.TASK,
    activityType: _.get(schema, 'name', ''),
    ref: schema.ref,
    name: _.get(schema, 'title', _.get(schema, 'name', 'Activity')),
    version: _.get(schema, 'version', ''),
    description: _.get(schema, 'description', ''),
    homepage: _.get(schema, 'homepage', ''),
    attributes: {
      inputs: _.get(schema, 'inputs', []),
      outputs: _.get(schema, 'outputs', [])
    },
    return: schema.return,
    __schema: _.cloneDeep(schema)
  };

  _.each(
    task.attributes.inputs, (input: any) => {
      // convert to task enumeration and provision default types
      _.assign(input, portAttribute(input, true));
    }
  );

  _.each(
    task.attributes.outputs, (output: any) => {
      // convert to task enumeration and provision default types
      _.assign(output, portAttribute(output));
    }
  );

  return task;
}

// mapping from schema.json of activity to the trigger can be used in flow.json
export function activitySchemaToTrigger(schema: any): any {

  const trigger: any = {
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    triggerType: _.get(schema, 'name', ''),
    ref: schema.ref,
    name: _.get(schema, 'title', _.get(schema, 'name', 'Activity')),
    version: _.get(schema, 'version', ''),
    description: _.get(schema, 'description', ''),
    homepage: _.get(schema, 'homepage', ''),
    settings: _.get(schema, 'settings', ''),
    outputs: _.get(schema, 'outputs', ''),
    endpoint: { settings: _.get(schema, 'endpoint.settings', '') } // ,
    // __schema: _.cloneDeep(schema)
  };

  _.each(
    trigger.inputs, (input: any) => {
      // convert to task enumeration and provision default types
      _.assign(input, portAttribute(input, true));
    }
  );

  _.each(
    trigger.outputs, (output: any) => {
      // convert to task enumeration and provision default types
      _.assign(output, portAttribute(output));
    }
  );


  return trigger;
}

// todo: name and location are too general and use case too specific
export function objectFromArray(arr, copyValues?) {
  const mappedSettings = {};
  const settings = arr || [];

  settings.forEach((setting) => {
    mappedSettings[setting.name] = copyValues ? setting.value : null;
  });

  return mappedSettings;
}

export function normalizeTaskName(taskName: string) {
  return _.kebabCase(taskName);
}

export function parseMapping(mappingValue: string) {
  // todo: support other scopes,: flow, env, property, etc.
  const processExprTail = (tail: string) => tail ? _.trimStart(tail, '.') : null;
  let taskId = null;
  let attributeName;
  let exprTail;
  let autoMap;

  const matchesActivity = /(\${activity\.([\w-]+)\.([\w-]+)}((?:\.[\w-]+)*))/.exec(mappingValue);
  if (matchesActivity) {
    taskId = matchesActivity[2] || null;
    attributeName = matchesActivity[3];
    exprTail = processExprTail(matchesActivity[4]);
    autoMap = `_A.${taskId}.${attributeName}`;
    return {
      autoMap,
      isRoot: false,
      taskId,
      attributeName,
      path: exprTail
    };
  }

  const matchesTrigger = /(\${trigger\.([\w-]+)}((?:\.[\w-]+)*))/.exec(mappingValue);
  if (matchesTrigger) {
    attributeName = matchesTrigger[2] || null;
    autoMap = `_T.${attributeName}`;
    exprTail = processExprTail(matchesTrigger[3]);
    return {
      autoMap,
      isRoot: true,
      taskId,
      attributeName,
      path: exprTail
    };
  }

  return null;

}

export function formatServerConfiguration(config: any) {
  return {
    db: {
      protocol: config.db.protocol,
      host: config.db.host,
      port: config.db.port,
      name: config.db.testPath,
      label: config.db.label
    },
    activities: {
      protocol: config.activities.protocol,
      host: config.activities.host,
      port: config.activities.port,
      testPath: config.activities.testPath,
      label: config.activities.label,
      db: {
        port: config.activities.port,
        name: config.activities.testPath
      }
    },
    triggers: {
      protocol: config.triggers.protocol,
      host: config.triggers.host,
      port: config.triggers.port,
      testPath: config.triggers.testPath,
      label: config.triggers.label,
      db: {
        port: config.triggers.port,
        name: config.triggers.testPath
      },
    },
    engine: {
      protocol: config.engine.protocol,
      host: config.engine.host,
      port: config.engine.port,
      testPath: config.engine.testPath
    },
    stateServer: {
      protocol: config.stateServer.protocol,
      host: config.stateServer.host,
      port: config.stateServer.port,
      testPath: config.stateServer.testPath
    },
    flowServer: {
      protocol: config.flowServer.protocol,
      host: config.flowServer.host,
      port: config.flowServer.port,
      testPath: config.flowServer.testPath
    }
  };
}

export function getURL(config: {
  protocol?: string;
  host?: string;
  port?: string;
}): string {
  if (config.port) {
    return `${config.protocol || location.protocol.replace(':', '')}://${config.host || location.hostname}:${config.port}`;
  } else {
    return `${config.protocol || location.protocol.replace(':', '')}://${config.host || location.hostname}}`;
  }
}

/**
 * Copies content of an element into the system clipboard.
 * (Taken from UI cloud pattern library)
 *
 * Not all browsers may be supported. See the following for details:
 * http://caniuse.com/clipboard
 * https://developers.google.com/web/updates/2015/04/cut-and-copy-commands
 * @param  {HTMLElement} element The element containing the text to copy
 * @return {boolean} whether the copy operation is succeeded
 */
export function copyToClipboard(element: HTMLElement) {
  const sel = window.getSelection();
  const snipRange = document.createRange();
  snipRange.selectNodeContents(element);
  sel.removeAllRanges();
  sel.addRange(snipRange);
  let res = false;
  try {
    res = document.execCommand('copy');
  } catch (err) {
    // copy command is not available
    console.error(err);
  }
  sel.removeAllRanges();
  return res;
}

/**
 * Create a notification
 *
 * @param message
 * @param type: information, success, warming, error
 * @param time: the time to autoclose; if not configured, the notification wouldn't be autoclosed.
 * @param settings: inline styles
 */
export function notification(message: string, type: string, time?: number, settings ?: any) {
  let styles = '';
  for (const key in settings) {
    if (settings.hasOwnProperty(key)) {
      styles += key + ':' + settings[key] + ';';
    }
  }
  let template = `<div style="${styles}" class="${type} flogo-common-notification">${message}`;
  if (!time) {
    template += `
    <i class="fa fa-times flogo-common-notification-close"></i>
    `;
  }
  template += '</div>';
  const notificationContainer = jQuery('body > .flogo-common-notification-container');
  if (notificationContainer.length) {
    notificationContainer.append(template);
  } else {
    jQuery('body').append(`<div class="flogo-common-notification-container">${template}</div>`);
  }
  const notification = jQuery('.flogo-common-notification-container>div:last');
  const notifications = jQuery('.flogo-common-notification-container>div');
  const maxCounter = 5;

  if (notifications.length > 5) {
    for (let i = 0; i < notifications.length - maxCounter; i++) {
      if (notifications[i]) {
        notifications[i].remove();
      }
    }
  }
  setTimeout(function () {
    notification.addClass('on');
  }, 100);
  return new Promise((resolve, reject) => {
    if (time) {
      setTimeout(function () {
        if (notification) {
          notification.remove();
        }
        if (!notificationContainer.html()) {
          notificationContainer.remove();
        }
      }, time);
    }
    if (!time) {
      notification.find('.flogo-common-notification-close').click(() => {
        notification.remove();
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export function attributeTypeToString(inType: any): string {
  if (_.isString(inType)) {
    return inType;
  }

  return (FLOGO_TASK_ATTRIBUTE_TYPE[inType] || 'string').toLowerCase();
}

/**
 * Get the difference between two dates
 *
 * @param beginDate: Inital date
 * @param endDate: Final date
 * @param timeUnit: Measurement unit
 */
export function diffDates(beginDate: any, endDate: any, timeUnit: any) {
  const begin = moment(beginDate);
  const end = moment(endDate);

  return begin.diff(end, timeUnit);

}

export function createSubFlowTask() {
  return {
    type: FLOGO_TASK_TYPE.TASK_SUB_PROC,
    name: 'Sub-Flow'
  };
}

export function getProfileType(app) {
  let profileType: FLOGO_PROFILE_TYPE;
  if (app.device) {
    profileType = FLOGO_PROFILE_TYPE.DEVICE;
  } else {
    profileType = FLOGO_PROFILE_TYPE.MICRO_SERVICE;
  }
  return profileType;
}

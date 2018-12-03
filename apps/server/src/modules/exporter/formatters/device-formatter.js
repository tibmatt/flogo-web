import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { appHasSubflowTasks } from '../../../common/utils/subflow';
import { ERROR_TYPES, ErrorManager } from '../../../common/errors';
import { mappingsToAttributes } from '../mappings-to-attributes';

const DEVICE_ACTION_REF = 'github.com/TIBCOSoftware/flogo-contrib/device/action/flow';

export class DeviceFormatter {
  constructor(activitySchemas) {
    this.activitySchemas = activitySchemas;
  }

  preprocess(app) {
    if (this.appHasSubflowTask(app)) {
      throw ErrorManager.makeError('Application cannot be exported', { type: ERROR_TYPES.COMMON.HAS_SUBFLOW });
    }
    app.triggers = this.expandTriggersHandlers(app.triggers);
    return app;
  }

  format(app) {
    app.type = 'flogo:device';
    app.triggers = this.formatTriggers(app.triggers);
    app.actions = app.actions.map(action => this.formatAction(action));
    return app;
  }

  expandTriggersHandlers(triggers) {
    const allTriggers = [];
    triggers.forEach(t => {
      t.handlers.forEach((handler, ind) => {
        const triggerName = t.name + (ind ? `(${ind})` : '');
        allTriggers.push(
          Object.assign({}, t, {
            name: triggerName,
            handlers: [handler],
          })
        );
      });
    });
    return allTriggers;
  }

  formatTriggers(triggers) {
    triggers.forEach(trigger => {
      trigger.actionId = trigger.handlers[0].actionId;
      // delete trigger.handlers;
    });
    return triggers;
  }

  formatAction(action) {
    action.ref = DEVICE_ACTION_REF;
    action.data = {
      flow: this.makeFlow(action),
    };
    delete action.name;
    return action;
  }

  formatTasks(tasks) {
    // preparing task attribute from inputMappings while formatting the tasks
    return tasks.map(task => {
      return {
        ...task,
        ...mappingsToAttributes(task, this.activitySchemas.find(schema => schema.ref === task.activityRef)),
        attributes: this.formatTaskAttributes(task),
      };
    });
  }

  formatTaskAttributes(task) {
    const attributes = {};
    task.attributes.forEach(attribute => {
      attributes[attribute.name] = attribute.value;
    });
    return attributes;
  }

  appHasSubflowTask(app) {
    return appHasSubflowTasks(app);
  }

  makeFlow(action) {
    const flowData = {
      name: action.name,
    };
    const { tasks, links } = action;
    if (isEmpty(tasks)) {
      return flowData;
    }
    flowData.links = cloneDeep(links);
    flowData.tasks = this.formatTasks(cloneDeep(tasks));
    return flowData;
  }
}

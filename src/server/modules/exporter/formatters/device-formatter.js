import cloneDeep from 'lodash/cloneDeep';
import { appHasSubflowTasks } from '../../../common/utils/subflow';
import { ERROR_TYPES, ErrorManager } from '../../../common/errors';

const DEVICE_ACTION_REF = 'github.com/TIBCOSoftware/flogo-contrib/device/action/flow';

export class DeviceFormatter {

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
        allTriggers.push(Object.assign({}, t, {
          name: triggerName,
          handlers: [handler],
        }));
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
    const flow = action.data.flow;
    if (flow) {
      flow.name = action.name;
      delete action.name;
      flow.links = cloneDeep(flow.rootTask.links);
      flow.tasks = cloneDeep(flow.rootTask.tasks);
      flow.tasks = this.formatTasks(flow);
    }
    return action;
  }

  formatTasks(flow) {
    return flow.tasks.map(task => ({
      ...task,
      attributes: this.formatTaskAttributes(task),
    }));
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

}

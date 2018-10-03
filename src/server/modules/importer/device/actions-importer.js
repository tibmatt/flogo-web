import { AbstractActionsImporter, portTaskTypeForIterators } from '../common';
import omit from 'lodash/omit';
import get from "lodash/get";

export class ActionsImporter extends AbstractActionsImporter {

  extractActions(fromRawApp) {
    return (fromRawApp.actions || [])
      .map(action => this.formatAction(action));
  }

  formatAction(action) {
    const formattedAction = omit(action, ['data']);
    formattedAction.name = get(action, 'data.flow.name', action.name || action.id);
    formattedAction.tasks = get(action, 'data.flow.tasks', []).map(task => this.mapTask(task));
    formattedAction.links = get(action, 'data.flow.links', []);
    return formattedAction;
  }

  mapTask(task) {
    task.attributes = task.attributes || [];
    const attributes = this
      .getSettingsSchema(task.activityRef)
      .map(attribute => ({
        ...attribute,
        value: task.attributes[attribute.name] || '',
      }));
    portTaskTypeForIterators(task);
    return { ...task, attributes };
  }

  getSettingsSchema(activityRef) {
    return this.activitySchemas
      .find(activitySchema => activitySchema.ref === activityRef)
      .settings || [];
  }

}

import { AbstractActionsImporter } from '../common';

export class ActionsImporter extends AbstractActionsImporter {

  extractActions(fromRawApp) {
    return (fromRawApp.actions || [])
      .map(action => this.formatAction(action));
  }

  formatAction(action) {
    if (!action.name) {
      action.name = action.id;
    }
    action.data = action.data ? action.data : {};
    const { flow } = action.data;
    if (flow) {
      const { tasks = [], links = [] } = flow;
      delete flow.tasks;
      delete flow.links;
      flow.attributes = [];
      flow.rootTask = {
        id: 1,
        type: 1,
        links,
        tasks: tasks.map(task => this.mapTask(task)),
      };
    }
    return action;
  }

  mapTask(task) {
    task.attributes = task.attributes || [];
    const attributes = this
      .getSettingsSchema(task.activityRef)
      .map(attribute => ({
        ...attribute,
        value: task.attributes[attribute.name] || '',
      }));
    return { ...task, attributes };
  }

  getSettingsSchema(activityRef) {
    return this.activitySchemas
      .find(activitySchema => activitySchema.ref === activityRef)
      .settings || [];
  }

}

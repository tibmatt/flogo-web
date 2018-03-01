import { AbstractActionsImporter } from '../common/abstract-actions-importer';

export class StandardActionsImporter extends AbstractActionsImporter {

  extractActions(fromRawApp) {
    const resources = fromRawApp.resources || [];
    return resources.map(resource => this.resourceToAction(resource));
  }

  resourceToAction(resource) {
    return {
      id: this.actionIdFromResourceId(resource.id),
      name: resource.name,
      metadata: this.extractMetadata(resource),
      flow: {
        id: 'root',
        tasks: this.mapTasks(resource.tasks),
      },
    };
  }

  extractMetadata(resource) {
    const metadata = { ...resource.metadata };
    metadata.input = metadata.input || [];
    metadata.output = metadata.output || [];
    return metadata;
  }

  actionIdFromResourceId(resourceId) {
    return resourceId.replace(/^flow:`/gi, '');
  }

  mapTasks(tasks = []) {
    return tasks.map(task => this.convertTask(task));
  }

  convertTask(task) {
    this.taskConverter.setStandardTask(task);
    this.taskConverter.setSchema(this.getActivitySchema(task.activity.ref));
    const task = this.taskConverter.getInternalModelTask();

    const type = task.type || 'standard';
    const mapTaskInputToAttributes;
  }
}

class TaskConverter {
  convert() {

  }
}

import { AbstractActionsImporter, portTaskTypeForIterators } from '../common';
import omit from 'lodash/omit';
import get from 'lodash/get';
import { TASK_HANDLER_NAME_ERROR } from '../../../common/constants';
import { normalizeTaskInputsToMappings } from './normalizeTaskInputsToMappings';

export class ActionsImporter extends AbstractActionsImporter {
  extractActions(fromRawApp) {
    return (fromRawApp.actions || []).map(this.formatAction);
  }

  formatAction(action) {
    const formattedAction = omit(action, ['data']);
    const rootTask = get(action, 'data.flow.rootTask');
    const errorHandlerTask = get(action, 'data.flow.errorHandlerTask');
    formattedAction.name = get(action, 'data.flow.name', action.name || action.id);
    if (rootTask) {
      formattedAction.tasks = (rootTask.tasks || [])
        .map(normalizeTaskInputsToMappings)
        .map(portTaskTypeForIterators);
      formattedAction.links = rootTask.links || [];
    }
    if (errorHandlerTask) {
      formattedAction[TASK_HANDLER_NAME_ERROR] = {
        tasks: (errorHandlerTask.tasks || [])
          .map(normalizeTaskInputsToMappings)
          .map(portTaskTypeForIterators),
        links: errorHandlerTask.links || [],
      };
    }
    return formattedAction;
  }
}

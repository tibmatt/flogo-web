import get from 'lodash/get';
import { ERROR_TYPES, ErrorManager } from '../../../common/errors';
import { isIterableTask } from '../../../common/utils';
import { FLOGO_TASK_TYPE } from '../../../common/constants';
import { appHasSubflowTask } from '../utils/do-actions-have-subflow-tasks';

const MICROSERVICE_ACTION_REF = 'github.com/TIBCOSoftware/flogo-contrib/action/flow';

export class LegacyMicroServiceFormatter {

  preprocess(app) {
    if (appHasSubflowTask(app)) {
      throw ErrorManager.makeError('Application cannot be exported', { type: ERROR_TYPES.COMMON.HAS_SUBFLOW });
    }
    return app;
  }

  format(app) {
    app.type = 'flogo:app';
    app.actions = app.actions.map(action => this.formatAction(action));
    return app;
  }

  formatAction(action) {
    action.ref = MICROSERVICE_ACTION_REF;

    const flow = action.data.flow;
    if (!flow) {
      return action;
    }

    flow.name = action.name;
    delete action.name;

    let allTasks = [];
    allTasks = allTasks.concat(get(action, 'data.flow.rootTask.tasks', []));
    allTasks = allTasks.concat(get(action, 'data.flow.errorHandlerTask.tasks', []));

    const hasExplicitReply = allTasks.find(t => t.activityRef === 'github.com/TIBCOSoftware/flogo-contrib/activity/reply');
    if (hasExplicitReply) {
      flow.explicitReply = true;
    }

    // Update task type of iterators as per engine specifications
    allTasks.filter(task => isIterableTask(task))
      .forEach(task => {
        task.type = FLOGO_TASK_TYPE.TASK_ITERATOR;
      });

    return action;
  }

}

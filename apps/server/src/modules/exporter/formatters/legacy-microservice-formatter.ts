import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { ERROR_TYPES, ErrorManager } from '../../../common/errors';
import { isIterableTask } from '../../../common/utils';
import { appHasSubflowTasks } from '../../../common/utils/subflow';
import { FLOGO_TASK_TYPE, LEGACY_FLOW_TYPE } from '../../../common/constants';
import { mappingsToAttributes } from '../mappings-to-attributes';

const MICROSERVICE_ACTION_REF = 'github.com/TIBCOSoftware/flogo-contrib/action/flow';

export class LegacyMicroServiceFormatter {
  constructor(private activitySchemas) {}

  preprocess(app) {
    if (appHasSubflowTasks(app)) {
      throw ErrorManager.makeError('Application cannot be exported', {
        type: ERROR_TYPES.COMMON.HAS_SUBFLOW,
      });
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

    action.data = {
      flow: this.makeFlow(action),
    };
    const flow = action.data.flow;
    delete action.name;

    let allTasks = [];
    allTasks = allTasks.concat(get(flow, 'rootTask.tasks', []));
    allTasks = allTasks.concat(get(flow, 'errorHandlerTask.tasks', []));

    /* The reply activity is deprecated in the flogo-contribs project.
     * But we are maintaining this for legacy applications */
    const hasExplicitReply = allTasks.find(
      t => t.activityRef === 'github.com/TIBCOSoftware/flogo-contrib/activity/reply'
    );
    if (hasExplicitReply) {
      flow.explicitReply = true;
    }

    // Update task type of iterators as per engine specifications
    allTasks
      .filter(task => isIterableTask(task))
      .forEach(task => {
        task.type = FLOGO_TASK_TYPE.TASK_ITERATOR;
      });

    // Prepare task with attributes from input mappings
    allTasks.forEach(task => {
      const activitySchema = this.activitySchemas.find(
        schema => schema.ref === task.activityRef
      );
      task = mappingsToAttributes(task, activitySchema);
    });
    return action;
  }

  makeFlow(action) {
    const errorHandlerTask = this.getErrorHandler(action.errorHandler);
    return {
      name: action.name,
      type: LEGACY_FLOW_TYPE,
      attributes: [],
      rootTask: {
        id: 'root',
        type: FLOGO_TASK_TYPE.TASK,
        links: action.links,
        tasks: action.tasks,
      },
      errorHandlerTask,
    };
  }

  getErrorHandler(errorHandler) {
    if (isEmpty(errorHandler) || isEmpty(errorHandler.tasks)) {
      return undefined;
    }
    const { tasks, links } = errorHandler;
    return {
      id: '__error_root',
      type: FLOGO_TASK_TYPE.TASK,
      tasks,
      links,
    };
  }
}

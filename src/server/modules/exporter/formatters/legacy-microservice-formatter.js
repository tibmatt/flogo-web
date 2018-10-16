import omit from 'lodash/omit';
import keyBy from 'lodash/keyBy';
import isEmpty from 'lodash/isEmpty';
import { ERROR_TYPES, ErrorManager } from '../../../common/errors';
import { isIterableTask } from '../../../common/utils';
import { appHasSubflowTasks } from '../../../common/utils/subflow';
import {FLOGO_TASK_TYPE, LEGACY_FLOW_TYPE} from '../../../common/constants';
import { mappingsToAttributes } from "../mappings-to-attributes";

const MICROSERVICE_ACTION_REF = 'github.com/TIBCOSoftware/flogo-contrib/action/flow';
const REPLY_ACTIVITY_REF = 'github.com/TIBCOSoftware/flogo-contrib/activity/reply';
const OMITTABLE_TASK_FIELDS = ['testConfigurations'];

export class LegacyMicroServiceFormatter {
  constructor(activitySchemas) {
    this.activitySchemas = keyBy(activitySchemas, 'ref');
  }

  preprocess(app) {
    if (appHasSubflowTasks(app)) {
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

    action.data = {
      flow: this.makeFlow(action)
    };
    delete action.name;
    return action;
  }

  makeFlow(action) {
    const errorHandlerTask = this.getErrorHandler(action.errorHandler);
    const flow = {
      name: action.name,
      type: LEGACY_FLOW_TYPE,
      attributes: [],
      rootTask: {
        id: 'root',
        type: FLOGO_TASK_TYPE.TASK,
        links: action.links,
        tasks: this.formatTasks(action.tasks)
      },
      errorHandlerTask
    };
    if (this.actionHasReply) {
      flow.explicitReply = true;
      this.resetActionHasReplyFlag();
    }
    return flow;
  }

  getErrorHandler(errorHandler) {
    if (isEmpty(errorHandler) || isEmpty(errorHandler.tasks)) {
      return undefined;
    }
    const {tasks, links} = errorHandler;
    return {
      id: '__error_root',
      type: FLOGO_TASK_TYPE.TASK,
      tasks: this.formatTasks(tasks),
      links
    }
  }

  formatTasks(tasks) {
    return (tasks).map(task => {
      const formattedTask = omit(task, OMITTABLE_TASK_FIELDS);
      if (task.activityRef === REPLY_ACTIVITY_REF) {
        this.markActionHasReply();
      }
      // Update task type of iterators as per engine specifications
      if (isIterableTask(task)) {
        formattedTask.type = FLOGO_TASK_TYPE.TASK_ITERATOR;
      }
      // Prepare task with attributes from input mappings
      return mappingsToAttributes(formattedTask, this.activitySchemas[formattedTask.activityRef]);
    });
  }

  resetActionHasReplyFlag() {
    this.actionHasReply = false;
  }

  markActionHasReply() {
    this.actionHasReply = true;
  }

}

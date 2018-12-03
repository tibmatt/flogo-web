import { Context } from 'koa';
import { ActionsManager } from '../../../../modules/actions';
import { ActivitiesManager } from '../../../../modules/activities';
import { ErrorManager } from '../../../../common/errors';
import { LegacyMicroServiceFormatter } from '../../../../modules/exporter/formatters/legacy-microservice-formatter';

export const findAndExportFlow = async (context: Context, next) => {
  const action = await ActionsManager.findOne(context.request.body.actionId);
  if (!action) {
    return context.throw(ErrorManager.createRestNotFoundError('Now flow with specified id'));
  }
  context.state.flow = await transformToProcess(action);
  return next();
};

async function transformToProcess(action) {
  const activities = await ActivitiesManager.find();
  const exporter = new LegacyMicroServiceFormatter(activities);
  const {
    description,
    metadata,
    data: { flow },
  } = exporter.formatAction(action);
  return {
    name: flow.name,
    description: description || '',
    metadata: metadata || { input: [], output: [] },
    flow,
  };
}

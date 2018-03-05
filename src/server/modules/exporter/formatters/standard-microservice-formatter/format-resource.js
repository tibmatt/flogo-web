import isEmpty from 'lodash/isEmpty';
import { portAndFormatMappings } from './port-and-format-mappings';
import { formatTasks } from './format-tasks';
import { formatLinks } from './format-links';

export function formatResource(fromAction) {
  const mappings = portAndFormatMappings(fromAction.metadata);
  const flow = fromAction.data.flow || {};
  const { root: rootHandler, error: errorHandler } = formatHandlers(flow);

  return {
    id: `flow:${fromAction.id}`,
    data: {
      name: fromAction.name,
      description: !isEmpty(fromAction.description) ? fromAction.description : undefined,
      mappings: !isEmpty(mappings) ? mappings : undefined,
      ...rootHandler,
      errorHandler: !isEmpty(errorHandler) ? errorHandler : undefined,
    },
  };
}

function formatHandlers(flow) {
  return {
    root: formatHandler(flow.rootTask || {}),
    error: formatHandler(flow.errorHandlerTask || {}),
  };
}

function formatHandler({ tasks, links }) {
  const formattedTasks = formatTasks(tasks);
  const formattedLinks = formatLinks(links);
  return {
    tasks: !isEmpty(formattedTasks) ? formattedTasks : undefined,
    links: !isEmpty(formattedLinks) ? formattedLinks : undefined,
  };
}


import isEmpty from 'lodash/isEmpty';
import { formatLinks } from './format-links';
import { formatTasks } from './format-tasks';

export function formatTaskLinkGroups(activitySchemas, flow) {
  return {
    root: formatGroup(activitySchemas, flow.rootTask || {}),
    error: formatGroup(activitySchemas, flow.errorHandlerTask || {}),
  };
}

function formatGroup(activitySchemas, { tasks, links }) {
  const formattedTasks = formatTasks(activitySchemas, tasks);
  const formattedLinks = formatLinks(links);
  return {
    tasks: !isEmpty(formattedTasks) ? formattedTasks : undefined,
    links: !isEmpty(formattedLinks) ? formattedLinks : undefined,
  };
}

import isEmpty from 'lodash/isEmpty';
import { portAndFormatMappings } from './port-and-format-mappings';

export function formatResource(fromAction, taskLinkGroup) {
  const mappings = portAndFormatMappings(fromAction.metadata);
  const { root: rootHandler, error: errorHandler } = taskLinkGroup;

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


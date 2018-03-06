import isEmpty from 'lodash/isEmpty';
import { portAndFormatMappings } from './port-and-format-mappings';

export function formatResource(fromAction, taskLinkGroup) {
  const { metadata } = fromAction;
  const { root: rootHandler, error: errorHandler } = taskLinkGroup;

  return {
    id: `flow:${fromAction.id}`,
    data: {
      name: fromAction.name,
      description: !isEmpty(fromAction.description) ? fromAction.description : undefined,
      metadata: !isEmpty(metadata) ? metadata : undefined,
      ...rootHandler,
      errorHandler: !isEmpty(errorHandler) ? errorHandler : undefined,
    },
  };
}


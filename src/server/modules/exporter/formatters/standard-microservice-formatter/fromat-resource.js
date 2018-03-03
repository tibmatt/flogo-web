import isEmpty from 'lodash/isEmpty';

export function formatResource(fromAction) {
  return {
    id: `flow:${fromAction.id}`,
    data: {
      name: fromAction.name,
      description: !isEmpty(fromAction.description) ? fromAction.description : undefined,
      // metadata
      // tasks
      // links
      // errorHandler
    },
  };
}

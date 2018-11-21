import isEmpty from 'lodash/isEmpty';

export function formatResource(fromAction, taskLinkGroup) {
  const formattedMetadata = formatMetadata(fromAction.metadata);
  const { root: rootHandler, error: errorHandler } = taskLinkGroup;
  return {
    id: `flow:${fromAction.id}`,
    data: {
      name: fromAction.name,
      description: !isEmpty(fromAction.description) ? fromAction.description : undefined,
      metadata: !isEmpty(formattedMetadata) ? formattedMetadata : undefined,
      ...rootHandler,
      errorHandler: !isEmpty(errorHandler) ? errorHandler : undefined,
    },
  };
}

function formatMetadata(actionMetadata = {}) {
  return ['input', 'output']
    .reduce((formattedMetadata, type) => {
      if (!isEmpty(actionMetadata[type])) {
        formattedMetadata[type] = [...actionMetadata[type]];
      }
      return formattedMetadata;
    }, {});
}


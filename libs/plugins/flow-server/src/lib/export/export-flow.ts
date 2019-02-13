import { isEmpty } from 'lodash';
import { Resource, FlogoAppModel, FlowData, ResourceActionModel } from '@flogo-web/core';
import { formatTaskLinkGroups } from './format-task-link-group';

export function exportFlow(
  fromResource: Resource<FlowData>,
  activitySchemas
): FlogoAppModel.Resource<ResourceActionModel.FlowResourceData> {
  const formattedMetadata = formatMetadata(fromResource.metadata);
  const taskLinkGroup = formatTaskLinkGroups(activitySchemas, fromResource.data || {});
  const { root: rootHandler, error: errorHandler } = taskLinkGroup;
  return {
    id: `flow:${fromResource.id}`,
    data: {
      name: fromResource.name,
      description: !isEmpty(fromResource.description)
        ? fromResource.description
        : undefined,
      metadata: !isEmpty(formattedMetadata) ? formattedMetadata : undefined,
      ...rootHandler,
      errorHandler: !isEmpty(errorHandler) ? errorHandler : undefined,
    },
  };
}

function formatMetadata(actionMetadata = {}) {
  return ['input', 'output'].reduce((formattedMetadata, type) => {
    if (!isEmpty(actionMetadata[type])) {
      formattedMetadata[type] = [...actionMetadata[type]];
    }
    return formattedMetadata;
  }, {});
}

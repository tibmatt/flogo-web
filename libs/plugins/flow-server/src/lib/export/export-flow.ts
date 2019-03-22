import { isEmpty } from 'lodash';
import {
  Resource,
  FlogoAppModel,
  FlowData,
  ResourceActionModel,
  Metadata,
  MetadataAttribute,
} from '@flogo-web/core';
import { ResourceExportContext } from '@flogo-web/lib-server/core';
import { formatTaskLinkGroups } from './format-task-link-group';

export function exportFlow(
  fromResource: Resource<FlowData>,
  context: ResourceExportContext
): FlogoAppModel.Resource<ResourceActionModel.FlowResourceData> {
  const formattedMetadata = formatMetadata(fromResource.metadata);
  const taskLinkGroup = formatTaskLinkGroups(fromResource.data || {}, context);
  const { root: rootHandler, error: errorHandler } = taskLinkGroup;
  return {
    id: fromResource.id,
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

const exportMetadataAttribute = ({
  name,
  type,
}: MetadataAttribute): ResourceActionModel.MetadataDefinition => ({
  name,
  type,
});
function formatMetadata(
  actionMetadata: Partial<Metadata> = {}
): ResourceActionModel.FlowResourceData['metadata'] {
  return ['input', 'output'].reduce((formattedMetadata, type) => {
    if (!isEmpty(actionMetadata[type])) {
      formattedMetadata[type] = actionMetadata[type].map(exportMetadataAttribute);
    }
    return formattedMetadata;
  }, {});
}

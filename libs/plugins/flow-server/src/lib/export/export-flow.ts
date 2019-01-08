import { Resource, ResourceExportContext } from '@flogo-web/server/core';
import { FlowData } from '../flow-data';
import { formatTaskLinkGroups } from './format-task-link-group';
import { formatResource } from './format-resource';

export function exportFlow(resource: Resource<FlowData>, context: ResourceExportContext) {
  const taskLinkGroup = formatTaskLinkGroups(context.contributionSchemas, resource || {});
  return formatResource(resource, taskLinkGroup);
}

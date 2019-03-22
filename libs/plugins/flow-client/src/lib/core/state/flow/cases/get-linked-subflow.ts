import { ItemSubflow } from '@flogo-web/lib-client/core';
export const getLinkedSubflow = (t: ItemSubflow) => t.settings && t.settings.flowPath;

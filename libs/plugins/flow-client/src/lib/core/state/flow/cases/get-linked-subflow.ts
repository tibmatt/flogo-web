import { ItemSubflow } from '@flogo-web/client/core';
export const getLinkedSubflow = (t: ItemSubflow) => t.settings && t.settings.flowPath;

import { ItemSubflow } from '@flogo/core';
export const getLinkedSubflow = (t: ItemSubflow) => t.settings && t.settings.flowPath;

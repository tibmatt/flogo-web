import { flogoIDEncode } from '@flogo/shared/utils';

export interface IFlogoFlowDiagramTaskLink {
  id: string;
  from: string;
  to: string;
  name ?: string;
}

export class FlogoFlowDiagramTaskLink {
  static genTaskLinkID(): string {
    return flogoIDEncode('FlogoFlowDiagramTaskLink::' + Date.now());
  };
}

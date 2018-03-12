import { flogoIDEncode } from '@flogo/shared/utils';

export class FlogoFlowDiagramTaskLink {
  static genTaskLinkID(): string {
    return flogoIDEncode('FlogoFlowDiagramTaskLink::' + Date.now());
  }
}

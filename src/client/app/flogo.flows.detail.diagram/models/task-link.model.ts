import { flogoIDEncode } from '../../../common/utils';
export interface IFlogoFlowDiagramTaskLink {
  id : string;
  from : string;
  to : string
  name ? : string;
}

export class FlogoFlowDiagramTaskLink {
  static genTaskLinkID() : string {
    return flogoIDEncode( 'FlogoFlowDiagramTaskLink::' + Date.now() );
  };
}

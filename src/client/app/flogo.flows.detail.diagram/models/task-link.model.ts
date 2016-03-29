export interface IFlogoFlowDiagramTaskLink {
  id : string;
  from : string;
  to : string
  name ? : string;
}

export class FlogoFlowDiagramTaskLink {
  static genTaskLinkID() : string {
    return btoa( 'FlogoFlowDiagramTaskLink::' + Date.now() );
  };
}

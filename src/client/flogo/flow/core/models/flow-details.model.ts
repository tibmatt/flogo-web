import {FLOGO_PROFILE_TYPE} from '@flogo/core/constants';
import {getProfileType} from '@flogo/shared/utils';

export class FlogoFlowDetails {
  id: string;
  associatedToAppId: string;
  applicationProfileType: FLOGO_PROFILE_TYPE;
  relatedSubFlows: Map<string, any>;

  constructor(flow, subFlowRelations) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
    this.applicationProfileType = getProfileType(flow.app);
    this.relatedSubFlows = new Map(<[string, any][]> subFlowRelations.map(a => [a.id, a]));
  }

  setFlowRelation(flow: any) {
    this.relatedSubFlows.set(flow.id, flow);
  }

  getFlowRelation(flowId) {
    return this.relatedSubFlows.get(flowId);
  }

  deleteFlowRelation(flowId) {
    this.relatedSubFlows.delete(flowId);
  }
}

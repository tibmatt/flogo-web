import {FLOGO_PROFILE_TYPE} from '@flogo/core/constants';
import {getProfileType} from '@flogo/shared/utils';
import {ActionBase} from '@flogo/core';

export class FlogoFlowDetails {
  id: string;
  associatedToAppId: string;
  applicationProfileType: FLOGO_PROFILE_TYPE;
  relatedSubFlows: Map<string, ActionBase>;

  constructor(flow, subFlowRelations: ActionBase[]) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
    this.applicationProfileType = getProfileType(flow.app);
    this.relatedSubFlows = new Map(<[string, ActionBase][]> subFlowRelations.map(a => [a.id, a]));
  }

  addSubflowSchema(flow: ActionBase) {
    this.relatedSubFlows.set(flow.id, flow);
  }

  getSubflowSchema(flowId: string): ActionBase {
    return this.relatedSubFlows.get(flowId);
  }

  deleteSubflowSchema(flowId: string) {
    this.relatedSubFlows.delete(flowId);
  }
}

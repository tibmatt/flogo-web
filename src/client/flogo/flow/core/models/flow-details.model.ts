import {FLOGO_PROFILE_TYPE} from '@flogo/core/constants';
import {getProfileType} from '@flogo/shared/utils';

/*export interface FlowDetails {
  id?: string;
  associatedToAppID?: string;
  applicationProfileType?: FLOGO_PROFILE_TYPE;
}*/

export class FlogoFlowDetails {
  id: string;
  associatedToAppId: string;
  applicationProfileType: FLOGO_PROFILE_TYPE;

  constructor(flow) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
    this.applicationProfileType = getProfileType(flow.app);
  }
}

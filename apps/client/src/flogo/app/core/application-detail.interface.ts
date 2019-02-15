import { App } from '@flogo-web/client-core';
import { ApplicationDetailState } from './application-detail-state.interface';

export interface ApplicationDetail {
  app: App;
  state: ApplicationDetailState;
}

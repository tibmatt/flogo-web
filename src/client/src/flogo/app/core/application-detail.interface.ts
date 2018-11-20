import { App } from './app.interface';
import { ApplicationDetailState } from './application-detail-state.interface';

export interface ApplicationDetail {
  app: App;
  state: ApplicationDetailState;
}

import {Observable} from 'rxjs';
import {ActionBase, ActivitySchema, FLOGO_PROFILE_TYPE} from '../../../core/index';

export interface TaskAddOptions {
  activities$: Observable<Activity[]>;
  appAndFlowInfo$: Observable<AppAndFlowInfo>;
  selectActivity: (activityRef: string, selectedSubFlow?: ActionBase) => void;
  installedActivity: (schema: ActivitySchema) => void;
  updateActiveState: (isOpen: boolean) => void;
}

export interface Activity {
  title: string;
  ref: string;
}

interface AppAndFlowInfo {
  appId: string;
  appProfileType: FLOGO_PROFILE_TYPE;
  actionId: string;
}

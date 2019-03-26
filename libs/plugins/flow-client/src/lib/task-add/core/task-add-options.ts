import { Observable } from 'rxjs';
import { Resource, ActivitySchema } from '@flogo-web/core';

export interface TaskAddOptions {
  activities$: Observable<Activity[]>;
  appAndFlowInfo$: Observable<AppAndFlowInfo>;
  selectActivity: (activityRef: string, selectedSubFlow?: Resource) => void;
  installedActivity: (schema: ActivitySchema) => void;
  updateActiveState: (isOpen: boolean) => void;
}

export interface Activity {
  title: string;
  ref: string;
}

interface AppAndFlowInfo {
  appId: string;
  actionId: string;
}

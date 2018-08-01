import { Component, Inject, InjectionToken, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {filterActivitiesBy} from './core/filter-activities-by';
import {ActionBase, ActivitySchema, CONTRIB_REF_PLACEHOLDER, FLOGO_PROFILE_TYPE} from '@flogo/core';

export interface TaskAddOptions {
  activities$: Observable<Activity[]>;
  appInfo$: Observable<AppInfo>;
  selectActivity: (activityRef: string, selectedSubFlow?: ActionBase) => void;
  installedActivity: (schema: ActivitySchema) => void;
  updateActiveState: (isOpen: boolean) => void;
}

export interface AppInfo {
  appId: string;
  appProfileType: FLOGO_PROFILE_TYPE;
  actionId: string;
}

export interface Activity {
  title: string;
  ref: string;
}

export const TASKADD_OPTIONS = new InjectionToken<TaskAddOptions>('flogo-flow-task-add');

@Component({
  templateUrl: 'task-add.component.html',
  styleUrls: ['task-add.component.less']
})
export class TaskAddComponent implements OnInit {

  filteredActivities$: Observable<Activity[]>;
  filterText$: ReplaySubject<string>;
  isInstallOpen = false;
  isSubflowOpen = false;

  constructor(@Inject(TASKADD_OPTIONS) private options: TaskAddOptions) {
    this.filterText$ = new ReplaySubject<string>(1);
  }

  ngOnInit() {
    this.filteredActivities$ = filterActivitiesBy(this.options.activities$, this.filterText$);
    this.filterText$.next('');
  }

  filterActivities(term: string) {
    this.filterText$.next(term);
  }

  selectActivity(ref: string) {
    if (ref === CONTRIB_REF_PLACEHOLDER.REF_SUBFLOW) {
      this.setSubflowWindowState(true);
    } else {
      this.options.selectActivity(ref);
    }
  }

  handleInstallerWindow(state: boolean) {
    this.isInstallOpen = state;
    this.updateWindowState();
  }

  handleFlowSelection(selectedFlow: ActionBase | string) {
    if (selectedFlow !== 'dismiss') {
      this.options.selectActivity(CONTRIB_REF_PLACEHOLDER.REF_SUBFLOW, selectedFlow as ActionBase);
    }
    this.setSubflowWindowState(false);
  }

  afterActivityInstalled(schema: ActivitySchema) {
    this.options.installedActivity(schema);
  }

  private updateWindowState() {
    this.options.updateActiveState(this.isInstallOpen || this.isSubflowOpen);
  }

  private setSubflowWindowState(state: boolean) {
    this.isSubflowOpen = state;
    this.updateWindowState();
  }
}

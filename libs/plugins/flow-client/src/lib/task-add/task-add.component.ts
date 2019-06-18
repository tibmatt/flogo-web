import { Component, Inject, InjectionToken, OnInit } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { Resource, CONTRIB_REFS } from '@flogo-web/core';

import { filterActivitiesBy } from './core/filter-activities-by';
import { Activity, TaskAddOptions } from './core/task-add-options';
import { ModalService } from '@flogo-web/lib-client/modal';
import { FlogoInstallerComponent } from '@flogo-web/lib-client/contrib-installer';
import { delay } from 'rxjs/operators';

export const TASKADD_OPTIONS = new InjectionToken<TaskAddOptions>('flogo-flow-task-add');

@Component({
  templateUrl: 'task-add.component.html',
  styleUrls: ['task-add.component.less'],
})
export class TaskAddComponent implements OnInit {
  filteredActivities$: Observable<Activity[]>;
  filterText$: ReplaySubject<string>;
  isInstallOpen = false;
  isSubflowOpen = false;
  SUBFLOW_REF = CONTRIB_REFS.SUBFLOW;

  constructor(
    @Inject(TASKADD_OPTIONS) public options: TaskAddOptions,
    private modalService: ModalService
  ) {
    this.filterText$ = new ReplaySubject<string>(1);
  }

  ngOnInit() {
    this.filteredActivities$ = filterActivitiesBy(
      this.options.activities$,
      this.filterText$
    );
    this.filterText$.next('');
  }

  filterActivities(term: string) {
    this.filterText$.next(term);
  }

  selectActivity(ref: string) {
    if (ref === this.SUBFLOW_REF) {
      this.setSubflowWindowState(true);
    } else {
      this.options.selectActivity(ref);
    }
  }

  handleInstallerWindow(state: boolean) {
    this.isInstallOpen = true;
    if (state) {
      this.modalService
        .openModal<void>(FlogoInstallerComponent)
        .detach.pipe(delay(100))
        .subscribe(() => {
          this.isInstallOpen = false;
          this.updateWindowState();
        });
    }
    this.updateWindowState();
  }

  handleFlowSelection(selectedFlow: Resource | string) {
    if (typeof selectedFlow !== 'string') {
      this.options.selectActivity(this.SUBFLOW_REF, selectedFlow);
    }
    this.setSubflowWindowState(false);
  }

  private updateWindowState() {
    this.options.updateActiveState(this.isInstallOpen || this.isSubflowOpen);
  }

  private setSubflowWindowState(state: boolean) {
    this.isSubflowOpen = state;
    this.updateWindowState();
  }
}

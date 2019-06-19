import {
  Component,
  Inject,
  InjectionToken,
  OnInit,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { Observable, ReplaySubject } from 'rxjs';

import { Resource, CONTRIB_REFS } from '@flogo-web/core';
import { FlogoInstallerComponent } from '@flogo-web/lib-client/contrib-installer';

import { filterActivitiesBy } from './core/filter-activities-by';
import { Activity, TaskAddOptions } from './core/task-add-options';
import { ModalService } from '@flogo-web/lib-client/modal';
import { delay } from 'rxjs/operators';

export const TASKADD_OPTIONS = new InjectionToken<TaskAddOptions>('flogo-flow-task-add');

@Component({
  templateUrl: 'task-add.component.html',
  styleUrls: ['task-add.component.less'],
})
export class TaskAddComponent implements OnInit, AfterViewInit {
  filteredActivities$: Observable<Activity[]>;
  filterText$: ReplaySubject<string>;
  isInstallOpen = false;
  isSubflowOpen = false;

  constructor(
    @Inject(TASKADD_OPTIONS) public control: TaskAddOptions,
    private modalService: ModalService,
    private elementRef: ElementRef,
    private focusTrap: FocusTrapFactory
  ) {
    this.filterText$ = new ReplaySubject<string>(1);
  }

  ngAfterViewInit() {
    const focusTrap = this.focusTrap.create(this.elementRef.nativeElement);
    focusTrap.focusInitialElement();
  }

  ngOnInit() {
    this.filteredActivities$ = filterActivitiesBy(
      this.control.activities$,
      this.filterText$
    );
    this.filterText$.next('');
  }

  filterActivities(term: string) {
    this.filterText$.next(term);
  }

  selectActivity(ref: string) {
    if (ref === CONTRIB_REFS.SUBFLOW) {
      this.setSubflowWindowState(true);
    } else {
      this.control.selectActivity(ref);
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
      this.control.selectActivity(CONTRIB_REFS.SUBFLOW, selectedFlow);
    }
    this.setSubflowWindowState(false);
  }

  @HostListener('keyup.escape')
  cancel() {
    this.control.cancel();
  }

  private updateWindowState() {
    this.control.updateActiveState(this.isInstallOpen || this.isSubflowOpen);
  }

  private setSubflowWindowState(state: boolean) {
    this.isSubflowOpen = state;
    this.updateWindowState();
  }
}

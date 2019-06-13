import {
  Component,
  Inject,
  InjectionToken,
  OnInit,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  HostListener,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { FocusTrapFactory, ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Resource, CONTRIB_REFS } from '@flogo-web/core';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { FlogoInstallerComponent } from '@flogo-web/lib-client/contrib-installer';

import { filterActivitiesBy } from './core/filter-activities-by';
import { Activity, TaskAddOptions } from './core/task-add-options';
import { ModalService } from '@flogo-web/lib-client/modal';
import { delay } from 'rxjs/operators';
import { ActivityComponent } from './activity/activity.component';

export const TASKADD_OPTIONS = new InjectionToken<TaskAddOptions>('flogo-flow-task-add');

@Component({
  templateUrl: 'task-add.component.html',
  styleUrls: ['task-add.component.less'],
})
export class TaskAddComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(ActivityComponent) optionListItems: QueryList<ActivityComponent>;
  // second list because there's no way to get the component reference and the element ref at the same time
  @ViewChildren(ActivityComponent, { read: ElementRef }) optionListItemsRefs: QueryList<
    ElementRef
  >;
  @ViewChild('activityList', { read: ElementRef }) activityListRef: ElementRef;
  filteredActivities$: Observable<Activity[]>;
  filterText$: ReplaySubject<string>;
  isInstallOpen = false;
  isSubflowOpen = false;
  private destroy$ = SingleEmissionSubject.create();
  private keyboardEventsManager: ActiveDescendantKeyManager<ActivityComponent>;

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
    this.keyboardEventsManager = new ActiveDescendantKeyManager(this.optionListItems);
    this.keyboardEventsManager.change.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.ensureCurrentListOptionVisible();
    });
    this.filteredActivities$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.keyboardEventsManager.setActiveItem(null));
  }

  ngOnInit() {
    this.filteredActivities$ = filterActivitiesBy(
      this.control.activities$,
      this.filterText$
    );
    this.filterText$.next('');
  }

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
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

  onFocusList() {
    if (!this.keyboardEventsManager.activeItem) {
      this.keyboardEventsManager.setFirstItemActive();
    }
  }

  listKeyDown(event) {
    if (event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW) {
      this.keyboardEventsManager.onKeydown(event);
      event.preventDefault();
    } else if (event.keyCode === ENTER && this.keyboardEventsManager.activeItem) {
      this.keyboardEventsManager.activeItem.select();
      event.preventDefault();
    }
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

  private ensureCurrentListOptionVisible() {
    if (!this.keyboardEventsManager.activeItem) {
      return;
    }

    const list = this.activityListRef.nativeElement;
    const listBottom = list.scrollTop + list.clientHeight;

    const currentListItem = this.optionListItemsRefs.toArray()[
      this.keyboardEventsManager.activeItemIndex
    ].nativeElement;
    const currentElementTop = currentListItem.offsetTop - list.offsetTop;
    const currentElementBottom = currentElementTop + currentListItem.clientHeight;

    const isNotVisible =
      currentElementTop < list.scrollTop || currentElementBottom > listBottom;
    if (isNotVisible) {
      currentListItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
}

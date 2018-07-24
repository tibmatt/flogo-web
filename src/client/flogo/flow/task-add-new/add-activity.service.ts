import {Injectable, InjectionToken, Injector} from '@angular/core';
import {FlowActions, FlowSelectors, FlowState} from '@flogo/flow/core/state';
import {Store} from '@ngrx/store';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {Activity, TaskAddComponent, TASKADD_OPTIONS, TaskAddOptions} from './task-add.component';
import {Observable} from 'rxjs';
import {distinctUntilChanged, filter, share, takeUntil} from 'rxjs/operators';
import {isEqual} from 'lodash';
import {SingleEmissionSubject} from '@flogo/flow/shared/mapper/shared/single-emission-subject';
import {CurrentSelection, SelectionType} from '@flogo/flow/core/models';

@Injectable()
export class AddActivityService {

  private installedActivities$: Observable<Activity[]>;
  private destroy$ = SingleEmissionSubject.create();
  private contentPortal: ComponentPortal<TaskAddComponent>;
  private popoverRef: OverlayRef;

  constructor(private store: Store<FlowState>, private injector: Injector, private overlay: Overlay) {}

  startSubscriptions() {
    this.installedActivities$ = this.store.select(FlowSelectors.getInstalledActivities)
      .pipe(takeUntil(this.destroy$));
    this.store.select(FlowSelectors.selectCurrentSelection).pipe(
      distinctUntilChanged(isEqual),
      share(),
      filter((currentSelection: CurrentSelection) => (currentSelection && currentSelection.type === SelectionType.InsertTask)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.openAddActivityPanel();
    });
  }

  closeAndDestroy() {
    this.destroy$.emitAndComplete();
    if (this.popoverRef) {
      this.closePopover();
      this.popoverRef.dispose();
      this.popoverRef = null;
    }
  }

  private openAddActivityPanel() {
    const taskAddOptions: TaskAddOptions = {
      activities: this.installedActivities$,
      onSelect: (ref: string) => this.selectedActivity(ref),
      onClose: () => this.closePopover()
    };
    const customTokens = new WeakMap<InjectionToken<TaskAddOptions>, TaskAddOptions>();
    customTokens.set(TASKADD_OPTIONS, taskAddOptions);
    const injector = new PortalInjector(this.injector, customTokens);
    this.contentPortal = new ComponentPortal(TaskAddComponent, null, injector);
    this.popoverRef = this.overlay.create({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });
    this.popoverRef.attach(this.contentPortal);
  }

  private selectedActivity(ref: string) {
    console.log('Selected activity is: ', ref);
  }

  private closePopover() {
    if (this.popoverRef && this.popoverRef.hasAttached()) {
      this.popoverRef.detach();
    }
    if (this.contentPortal && this.contentPortal.isAttached) {
      this.contentPortal.detach();
    }
    this.store.dispatch(new FlowActions.ClearSelection());
  }
}

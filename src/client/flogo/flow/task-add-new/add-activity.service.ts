import {Injectable, InjectionToken, Injector} from '@angular/core';
import {FlowActions, FlowSelectors, FlowState} from '@flogo/flow/core/state';
import {Store} from '@ngrx/store';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {Activity, AppInfo, TaskAddComponent, TASKADD_OPTIONS, TaskAddOptions} from './task-add.component';
import {Observable} from 'rxjs';
import {CurrentSelection, SelectionType} from '@flogo/flow/core/models';
import {createTaskAddAction} from '@flogo/flow/task-add-new/models/task-add-action-creator';
import {ActionBase, ActivitySchema, BUTTON_INSERT_CLASS, SELECTED_INSERT_TILE_CLASS} from '@flogo/core';

@Injectable()
export class AddActivityService {

  shouldKeepPopoverActive: boolean;
  popoverReference: OverlayRef;

  private installedActivities$: Observable<Activity[]>;
  private appAndFlowInfo$: Observable<AppInfo>;
  private contentPortal: ComponentPortal<TaskAddComponent>;
  private parentId: string;

  constructor(private store: Store<FlowState>, private injector: Injector, private overlay: Overlay) {}

  startSubscriptions() {
    this.installedActivities$ = this.store.select(FlowSelectors.getInstalledActivities);
    this.appAndFlowInfo$ = this.store.select(FlowSelectors.selectAppAndFlowInfo);
  }

  cancel() {
    this.store.dispatch(new FlowActions.CancelCreateItem({parentId: this.parentId}));
  }

  closeAndDestroy() {
    if (this.popoverReference) {
      this.popoverReference.dispose();
      this.popoverReference = null;
    }
  }

  open(attachTo: HTMLElement, parentId: string) {
    this.parentId = parentId;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(<HTMLElement>attachTo.querySelector(`.${SELECTED_INSERT_TILE_CLASS} .${BUTTON_INSERT_CLASS}`))
      .withPositions(
        [
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
          { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
          { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' }
        ]
      );
    if (!this.contentPortal) {
      const customTokens = this.createInjectorTokens();
      const injector = new PortalInjector(this.injector, customTokens);
      this.contentPortal = new ComponentPortal(TaskAddComponent, null, injector);
    }
    if (!this.popoverReference) {
      this.popoverReference = this.overlay.create();
    }
    if (!this.popoverReference.hasAttached()) {
      this.popoverReference.attach(this.contentPortal);
    }
    positionStrategy.attach(this.popoverReference);
    positionStrategy.apply();
  }

  close() {
    if (this.popoverReference && this.popoverReference.hasAttached()) {
      this.popoverReference.detach();
    }
    if (this.contentPortal && this.contentPortal.isAttached) {
      this.contentPortal.detach();
    }
  }

  private createInjectorTokens(): WeakMap<InjectionToken<TaskAddOptions>, TaskAddOptions> {
    const taskAddOptions: TaskAddOptions = {
      activities$: this.installedActivities$,
      appAndFlowInfo$: this.appAndFlowInfo$,
      selectActivity: (ref: string, selectedSubFlow?: ActionBase) => this.selectedActivity(ref, selectedSubFlow),
      installedActivity: (schema: ActivitySchema) => this.store.dispatch(new FlowActions.ActivityInstalled(schema)),
      updateActiveState: (isOpen: boolean) => (this.shouldKeepPopoverActive = isOpen)
    };
    return new WeakMap<InjectionToken<TaskAddOptions>, TaskAddOptions>()
      .set(TASKADD_OPTIONS, taskAddOptions);
  }

  private selectedActivity(ref: string, flowData?: ActionBase) {
    createTaskAddAction(
      this.store,
      {ref, flowData}
    ).subscribe((action: FlowActions.TaskItemCreated) => {
      this.store.dispatch(action);
    });
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import { MapperController } from '@flogo/flow/shared/mapper/services/mapper-controller/mapper-controller';

import { TriggerConfigureSelectors, TriggerConfigureActions } from '@flogo/flow/core/state/triggers-configure';
import { FlowState } from '@flogo/flow/core/state';
import { TriggerConfigureTabType, TriggerConfigureTab } from '@flogo/flow/core/interfaces';

import { CurrentTriggerState, TriggerInformation } from '../interfaces';
import { ConfigureDetailsService } from './details.service';
import { ConfiguratorService } from '../services/configurator.service';

type MapperSubscriberFn = (controller: MapperController, groupType: TriggerConfigureTabType) => void;

@Component({
  selector: 'flogo-flow-triggers-configurator-detail',
  styleUrls: [
    'trigger-detail.component.less'
  ],
  templateUrl: 'trigger-detail.component.html',
  providers: [],
})
export class TriggerDetailComponent implements OnInit, OnDestroy {
  TAB_TYPES = TriggerConfigureTabType;

  selectedTriggerId: string;

  isSaving$: Observable<boolean>;
  overallStatus$: Observable<{ isDirty: boolean, isValid: boolean }>;
  tabs$: Observable<TriggerConfigureTab[]>;
  currentTabType: TriggerConfigureTabType;

  flowInputMapperController?: MapperController;
  replyMapperController?: MapperController;
  settingsForm: FormGroup;
  settingsTriggerInformation: TriggerInformation;

  private previousState: CurrentTriggerState;
  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private store: Store<FlowState>,
    private detailsService: ConfigureDetailsService,
    private configuratorService: ConfiguratorService,
  ) {}

  ngOnInit() {
    this.overallStatus$ = this.store.pipe(
      TriggerConfigureSelectors.getCurrentTriggerOverallStatus,
      shareReplay(),
    );

    this.tabs$ = this.store.pipe(TriggerConfigureSelectors.getCurrentTabs);
    this.store
      .select(TriggerConfigureSelectors.getCurrentTabType)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(currentTabType => {
        this.currentTabType = currentTabType;
      });

    this.isSaving$ = this.store.pipe(TriggerConfigureSelectors.getCurrentTriggerIsSaving);
    const getCurrentTriggerState = this.store.select(TriggerConfigureSelectors.getConfigureState).pipe(take(1));
    this.store.select(TriggerConfigureSelectors.selectCurrentTriggerId)
      .pipe(
        filter(currentTriggerId => !!currentTriggerId),
        switchMap(() => getCurrentTriggerState),
        takeUntil(this.ngDestroy$),
      )
      .subscribe((state) => {
        this.previousState = state;
        this.reconfigure(state);
      });
  }

  ngOnDestroy() {
    this.isSaving$ = null;
    this.ngDestroy$.emitAndComplete();
  }

  save() {
    const currentTriggerId = this.selectedTriggerId;
    this.configuratorService.save()
      .subscribe(() => {
        const isUpdateStillApplicable = this.selectedTriggerId !== currentTriggerId || !this.ngDestroy$.closed;
        if (!isUpdateStillApplicable) {
          return;
        }
        this.settingsForm.reset(this.settingsForm.getRawValue());
        if (this.flowInputMapperController) {
          this.flowInputMapperController.resetStatus();
        }
        if (this.replyMapperController) {
          this.replyMapperController.resetStatus();
        }
      });
  }

  onTabSelected(tab: TriggerConfigureTab) {
    if (tab.type !== this.currentTabType) {
      this.store.dispatch(new TriggerConfigureActions.SelectTab(tab.type));
    }
  }

  updateSettingsStatus(settingsStatus: {isValid: boolean, isDirty: boolean}) {
    this.updateTabState(TriggerConfigureTabType.Settings, settingsStatus);
  }

  discardChanges() {
    if (this.previousState) {
      this.reconfigure(this.previousState);
    }
  }

  private reconfigure(state: CurrentTriggerState) {
    this.selectedTriggerId = state.trigger.id;
    const { settings, flowInputMapper, replyMapper, triggerInformation } = this.detailsService.build(state);
    if (this.settingsForm) {
      this.settingsForm.enable();
    }
    this.settingsForm = settings;
    this.settingsTriggerInformation = triggerInformation;
    this.updateSettingsStatus({ isValid: this.settingsForm.valid, isDirty: this.settingsForm.dirty });

    const subscribeToUpdates = this.createMapperStatusUpdateSubscriber();

    this.flowInputMapperController = flowInputMapper;
    this.reconfigureMapperController(this.flowInputMapperController, TriggerConfigureTabType.FlowInputMappings, subscribeToUpdates);

    this.replyMapperController = replyMapper;
    this.reconfigureMapperController(this.replyMapperController, TriggerConfigureTabType.FlowOutputMappings, subscribeToUpdates);

    this.configuratorService.setParams({
      settings: this.settingsForm,
      flowInputMapper: this.flowInputMapperController,
      replyMapper: this.replyMapperController,
    });
  }

  private reconfigureMapperController(
    controller: MapperController,
    groupType: TriggerConfigureTabType,
    subscribeToUpdates: MapperSubscriberFn
  ) {
    if (controller) {
      subscribeToUpdates(controller, groupType);
      this.updateTabState(groupType, { isEnabled: true });
    } else {
      this.updateTabState(groupType, { isDirty: false, isValid: true, isEnabled: false });
    }
  }

  private updateTabState(groupType: TriggerConfigureTabType, newStatus) {
    this.store.dispatch(new TriggerConfigureActions.ConfigureStatusChanged({
      triggerId: this.selectedTriggerId,
      groupType,
      newStatus,
    }));
  }

  private createMapperStatusUpdateSubscriber(): MapperSubscriberFn {
    return (controller: MapperController, groupType: TriggerConfigureTabType) => {
      controller.status$
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(status => this.updateTabState(groupType, status));
    };
  }

}

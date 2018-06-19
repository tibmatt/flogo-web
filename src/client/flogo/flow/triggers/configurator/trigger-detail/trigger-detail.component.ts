import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import { MapperController } from '@flogo/flow/shared/mapper/services/mapper-controller/mapper-controller';

import { TriggerConfigureSelectors, TriggerConfigureActions } from '@flogo/flow/core/state/triggers-configure';
import { FlowState } from '@flogo/flow/core/state';
import { TriggerConfigureTabType, TriggerConfigureTab } from '@flogo/flow/core/interfaces';

import { CurrentTriggerState } from '../interfaces';
import { ConfigureDetailsService } from './details.service';

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

  tabs$: Observable<TriggerConfigureTab[]>;
  currentTabType: TriggerConfigureTabType;

  flowInputMapperController: MapperController;
  replyMapperController: MapperController;
  settingsForm: FormGroup;

  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private store: Store<FlowState>,
    private detailsService: ConfigureDetailsService,
  ) {
  }

  ngOnInit() {
    this.tabs$ = this.store.pipe(TriggerConfigureSelectors.getCurrentTabs);
    this.store
      .select(TriggerConfigureSelectors.getCurrentTabType)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(currentTabType => {
        this.currentTabType = currentTabType;
      });

    const getCurrentTriggerState = this.store.select(TriggerConfigureSelectors.getConfigureState).pipe(take(1));
    this.store.select(TriggerConfigureSelectors.selectCurrentTriggerId)
      .pipe(
        filter(currentTriggerId => !!currentTriggerId),
        switchMap(() => getCurrentTriggerState),
        takeUntil(this.ngDestroy$),
      )
      .subscribe((state) => this.restart(state));
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  onTabSelected(tab: TriggerConfigureTab) {
    if (tab.type !== this.currentTabType) {
      this.store.dispatch(new TriggerConfigureActions.SelectTab(tab.type));
    }
  }

  updateSettingsStatus(settingsStatus: {isValid: boolean, isDirty: boolean}) {
    this.store.dispatch(new TriggerConfigureActions.ConfigureStatusChanged({
      triggerId: this.selectedTriggerId,
      groupType: TriggerConfigureTabType.Settings,
      newStatus: settingsStatus
    }));
  }

  private restart(state: CurrentTriggerState) {
    this.selectedTriggerId = state.trigger.id;
    const { settings, flowInputMapper, replyMapper } = this.detailsService.build(state);
    this.settingsForm = settings;

    const subscribeToUpdates = this.createMapperStatusUpdateSubscriber();
    this.flowInputMapperController = flowInputMapper;
    subscribeToUpdates(this.flowInputMapperController, TriggerConfigureTabType.FlowInputMappings);
    this.replyMapperController = replyMapper;
    subscribeToUpdates(this.replyMapperController, TriggerConfigureTabType.FlowOutputMappings);
  }

  private createMapperStatusUpdateSubscriber() {
    return (controller: MapperController, groupType: TriggerConfigureTabType) => {
      controller.status$
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(status => {
          this.store.dispatch(new TriggerConfigureActions.ConfigureStatusChanged({
            triggerId: this.selectedTriggerId,
            groupType,
            newStatus: status,
          }));
        });
    };
  }

}

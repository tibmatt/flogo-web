import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import { MapperController } from '@flogo/flow/shared/mapper/services/mapper-controller/mapper-controller';

import { TriggerConfigureSelectors, TriggerConfigureActions } from '@flogo/flow/core/state/triggers-configure';
import { FlowState } from '@flogo/flow/core/state';
import { TriggerConfigureTabType, TriggerConfigureTab } from '@flogo/flow/core/interfaces';

import { CurrentTriggerState, TriggerStatus } from '../interfaces';
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

  @Output() statusChange = new EventEmitter<TriggerStatus>(true);

  TAB_TYPES = TriggerConfigureTabType;

  selectedTriggerId: string;

  overallStatus$: Observable<{ isDirty: boolean, isValid: boolean }>;
  tabs$: Observable<TriggerConfigureTab[]>;
  currentTabType: TriggerConfigureTabType;

  flowInputMapperController: MapperController;
  replyMapperController: MapperController;
  settingsForm: FormGroup;

  private previousState: CurrentTriggerState;
  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private store: Store<FlowState>,
    private detailsService: ConfigureDetailsService,
  ) {}

  ngOnInit() {
    this.overallStatus$ = this.store.pipe(
      TriggerConfigureSelectors.getCurrentTirggerOverallStatus,
      shareReplay(),
    );
    this.overallStatus$
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(this.statusChange);

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
      .subscribe((state) => {
        this.previousState = state;
        this.restart(state);
      });
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  save() {
    // todo: link to save service to persist changes
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

  discardChanges() {
    if (this.previousState) {
      this.restart(this.previousState);
    }
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

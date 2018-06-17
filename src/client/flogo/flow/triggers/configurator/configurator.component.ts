import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged, filter, map, skip, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { pipe } from 'rxjs/util/pipe';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import { TriggerConfigureTabType } from '@flogo/flow/core/interfaces';
import { FlowState } from '@flogo/flow/core/state';
import { TriggerConfigureSelectors, TriggerConfigureActions } from '@flogo/flow/core/state/triggers-configure';
import { MapperControllerFactory, MapperController } from '@flogo/flow/shared/mapper';

import { configuratorAnimations } from './configurator.animations';
import { ConfiguratorStatus, TriggerStatus } from './interfaces';
import { ConfiguratorService as TriggerConfiguratorService } from './configurator.service';
import { ContribSchema, FlowMetadata } from '@flogo/core';

@Component({
  selector: 'flogo-triggers-configuration',
  templateUrl: 'configurator.component.html',
  styleUrls: [
    '../../../../assets/_mapper-modal.less',
    'configurator.component.less'
  ],
  animations: configuratorAnimations
})
export class ConfiguratorComponent implements OnDestroy {
  isInitialized$: Observable<boolean>;
  triggerStatuses$: Observable<TriggerStatus[]>;
  selectedTriggerId: string;
  currentConfiguratorState: ConfiguratorStatus = {
    isOpen: false,
    disableSave: true,
    triggers: [],
    selectedTriggerId: null
  };
  currentTabType$: Observable<TriggerConfigureTabType>;
  flowInputMapperController: MapperController;
  replyMapperController: MapperController;
  TAB_TYPES = TriggerConfigureTabType;
  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private triggerConfiguratorService: TriggerConfiguratorService,
    private store: Store<FlowState>,
    private mapperControllerFactory: MapperControllerFactory,
  ) {
    this.triggerConfiguratorService.configuratorStatus$
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((nextStatus: ConfiguratorStatus) => this.onNextStatus(nextStatus));

    this.isInitialized$ = this.store.select(TriggerConfigureSelectors.getHasTriggersConfigure);
    const triggerStatuses$ = this.store.select(TriggerConfigureSelectors.getTriggerStatuses);
    this.triggerStatuses$ = this.observeWhileConfiguratorIsActive(triggerStatuses$, []);

    const currentTriggerId$ = this.store.select(TriggerConfigureSelectors.selectCurrentTriggerId);
    this.currentTabType$ = this.observeWhileConfiguratorIsActive(
      this.store.select(TriggerConfigureSelectors.getCurrentTabType),
      null
    );

    this.isInitialized$
      .pipe(
        filter(initialized => initialized),
        switchMap(() => currentTriggerId$),
        filter(triggerId => !!triggerId),
        switchMap(() => this.store
          .select(TriggerConfigureSelectors.getConfigureState)
          .pipe(take(1))
        ),
        takeUntil(this.ngDestroy$),
      )
      .subscribe((state) => this.init(state));
  }

  private init(state) {
    this.selectedTriggerId = state.trigger.id;
    this.initializeMapperControllers(state.flowMetadata, state.schema, state.handler.actionMappings);
  }

  onNextStatus(nextStatus: ConfiguratorStatus) {
    this.currentConfiguratorState = {
      ...this.currentConfiguratorState,
      ...nextStatus
    };
  }

  changeTriggerSelection(triggerId: string) {
    this.store.dispatch(new TriggerConfigureActions.SelectTrigger(triggerId));
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  onCloseOrDismiss() {
    this.triggerConfiguratorService.close();
  }

  onSave() {
    this.triggerConfiguratorService.save();
  }

  private initializeMapperControllers(flowMetadata: FlowMetadata, triggerSchema: ContribSchema, actionMappings) {
    const { input, output } = actionMappings;
    const subscribeToUpdates = this.mapperStatusUpdateSubscriber();
    this.initializeInputMapperController(flowMetadata, triggerSchema, input);
    subscribeToUpdates(this.flowInputMapperController, TriggerConfigureTabType.FlowInputMappings);

    this.initializeReplyMapperController(flowMetadata, triggerSchema, output);
    subscribeToUpdates(this.replyMapperController, TriggerConfigureTabType.FlowOutputMappings);
  }

  private initializeReplyMapperController(flowMetadata, triggerSchema, output: any) {
    this.replyMapperController = this.mapperControllerFactory.createController(
      flowMetadata && flowMetadata.output ? flowMetadata.output : [],
      triggerSchema.reply || [],
      output,
    );
  }

  private initializeInputMapperController(flowMetadata, triggerSchema, input: any) {
    this.flowInputMapperController = this.mapperControllerFactory.createController(
      flowMetadata && flowMetadata.input ? flowMetadata.input : [],
      triggerSchema.outputs || [],
      input
    );
  }

  private observeWhileConfiguratorIsActive<T>(observable$: Observable<T>, valueWhenNotInitialized: any) {
    return this.isInitialized$.pipe(
      switchMap(isInitialized => isInitialized ? observable$ : of(valueWhenNotInitialized)),
      takeUntil(this.ngDestroy$),
    );
  }

  private mapperStatusUpdateSubscriber() {
    return (controller: MapperController, groupType: TriggerConfigureTabType) => {
      controller.status$
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(status => {
          this.store.dispatch(new TriggerConfigureActions.MapperStatusChanged({
            triggerId: this.selectedTriggerId,
            groupType,
            newStatus: status,
          }));
        });
    };
  }

}

import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import { FlowState } from '../../../core/state';
import { MapperController } from '@flogo/flow/shared/mapper/services/mapper-controller/mapper-controller';
import * as TriggerConfigureActions from '../../../core/state/triggers-configure/trigger-configure.actions';
import { TriggerConfigureTabType, TriggerConfigureTab } from '../../../core/interfaces';
import { ContribSchema, FlowMetadata } from '@flogo/core';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { ConfiguratorService as TriggerConfiguratorService } from '@flogo/flow/triggers/configurator/configurator.service';
import { TriggerConfigureSelectors } from '@flogo/flow/core/state/triggers-configure';
import { MapperControllerFactory } from '@flogo/flow/shared/mapper';
import { getCurrentTabs, getCurrentTabType } from '@flogo/flow/core/state/triggers-configure/trigger-configure.selectors';

@Component({
  selector: 'flogo-flow-triggers-configurator-detail',
  styleUrls: [
    'trigger-detail.component.less'
  ],
  templateUrl: 'trigger-detail.component.html'
})
export class TriggerDetailComponent implements OnDestroy {

  @Input() mapperController: MapperController;

  selectedTriggerId: string;
  tabs$: Observable<TriggerConfigureTab[]>;
  currentTabType: TriggerConfigureTabType;
  flowInputMapperController: MapperController;
  replyMapperController: MapperController;
  TAB_TYPES = TriggerConfigureTabType;
  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private triggerConfiguratorService: TriggerConfiguratorService,
    private store: Store<FlowState>,
    private mapperControllerFactory: MapperControllerFactory,
  ) {
    this.tabs$ = this.store.pipe(getCurrentTabs);
    this.store
      .select(getCurrentTabType)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(currentTabType => {
        this.currentTabType = currentTabType;
      });

    this.store.select(TriggerConfigureSelectors.selectCurrentTriggerId)
      .pipe(
        switchMap(() => this.store
          .select(TriggerConfigureSelectors.getConfigureState)
          .pipe(take(1))
        ),
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

  private restart(state) {
    this.selectedTriggerId = state.trigger.id;
    this.initMapperControllers(state.flowMetadata, state.schema, state.handler.actionMappings);
  }

  private initMapperControllers(flowMetadata: FlowMetadata, triggerSchema: ContribSchema, actionMappings) {
    const { input, output } = actionMappings;
    const subscribeToUpdates = this.createMapperStatusUpdateSubscriber();
    this.flowInputMapperController = this.createInputMapperController(flowMetadata, triggerSchema, input);
    subscribeToUpdates(this.flowInputMapperController, TriggerConfigureTabType.FlowInputMappings);

    this.replyMapperController = this.createReplyMapperController(flowMetadata, triggerSchema, output);
    subscribeToUpdates(this.replyMapperController, TriggerConfigureTabType.FlowOutputMappings);
  }

  private createReplyMapperController(flowMetadata, triggerSchema, output: any) {
    return this.mapperControllerFactory.createController(
      flowMetadata && flowMetadata.output ? flowMetadata.output : [],
      triggerSchema.reply || [],
      output,
    );
  }

  private createInputMapperController(flowMetadata, triggerSchema, input: any) {
    return this.mapperControllerFactory.createController(
      flowMetadata && flowMetadata.input ? flowMetadata.input : [],
      triggerSchema.outputs || [],
      input
    );
  }

  private createMapperStatusUpdateSubscriber() {
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

import {Component, OnDestroy, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { switchMap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { Store } from '@ngrx/store';
import {ConfiguratorService as TriggerConfiguratorService} from './configurator.service';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import { configuratorAnimations } from './configurator.animations';
import { FlowState } from '@flogo/flow/core/state';
import { getHasTriggersConfigure, getTriggerStatuses, selectCurrentTriggerId } from '@flogo/flow/core/state/trigger-configure.selectors';
import * as TriggerConfigureActions from '@flogo/flow/core/state/trigger-configure.actions';
import { ConfiguratorStatus, TriggerStatus } from './interfaces';

@Component({
  selector: 'flogo-triggers-configuration',
  templateUrl: 'configurator.component.html',
  styleUrls: [
    '../../../../assets/_mapper-modal.less',
    'configurator.component.less'
  ],
  animations: configuratorAnimations
})
export class ConfiguratorComponent implements OnInit, OnDestroy {

  isInitialized$: Observable<boolean>;
  triggerStatuses$: Observable<TriggerStatus[]>;
  selectedTriggerId: string;
  currentConfiguratorState: ConfiguratorStatus = {
    isOpen: false,
    disableSave: true,
    triggers: [],
    selectedTriggerId: null
  };
  private ngDestroy = SingleEmissionSubject.create();

  constructor(private triggerConfiguratorService: TriggerConfiguratorService, private store: Store<FlowState>) {
  }

  ngOnInit() {
    this.triggerConfiguratorService.configuratorStatus$
      .pipe(takeUntil(this.ngDestroy))
      .subscribe((nextStatus: ConfiguratorStatus) => this.onNextStatus(nextStatus));
    this.isInitialized$ = this.store.select(getHasTriggersConfigure);

    const triggerStatuses$ = this.store.select(getTriggerStatuses);
    this.triggerStatuses$ = this.observeWhileInitialized(triggerStatuses$, []);

    const currentTriggerId$ = this.store.select(selectCurrentTriggerId);
    this.observeWhileInitialized(currentTriggerId$, null)
      .subscribe((selectedTriggerId) => this.selectedTriggerId = selectedTriggerId);
  }

  onNextStatus(nextStatus: ConfiguratorStatus) {
    this.currentConfiguratorState = {
      ...this.currentConfiguratorState,
      ...nextStatus
    };
  }

  changeTriggerSelection(triggerId: string) {
    this.store.dispatch(new TriggerConfigureActions.SelectTrigger(triggerId));
    // if (triggerId !== this.currentConfiguratorState.selectedTriggerId) {
    //   this.triggerConfiguratorService.selectTrigger(triggerId);
    // }
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  onCloseOrDismiss() {
    this.triggerConfiguratorService.close();
  }

  onSave() {
    this.triggerConfiguratorService.save();
  }

  private observeWhileInitialized<T>(observable$: Observable<T>, valueWhenNotInitialized: any) {
    return this.isInitialized$.pipe(
      switchMap(isInitialized => isInitialized ? observable$ : of(valueWhenNotInitialized)),
      takeUntil(this.ngDestroy),
    );
  }

}

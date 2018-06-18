import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { switchMap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';

import { TriggerConfigureSelectors } from '../../core/state/triggers-configure';
import * as TriggerConfigureActions from '../../core/state/triggers-configure/trigger-configure.actions';

import { configuratorAnimations } from './configurator.animations';
import {ConfiguratorService as TriggerConfiguratorService} from './configurator.service';
import { FlowState } from '../../core/state';
import { TriggerStatus, ConfigureTriggerDetails } from './interfaces';

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
  isConfiguratorInitialized$: Observable<boolean>;
  triggerStatuses$: Observable<TriggerStatus[]>;
  selectedTriggerId: string;
  isOpen: boolean;
  selectedTriggerDetails$: Observable<ConfigureTriggerDetails>;

  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(private triggerConfiguratorService: TriggerConfiguratorService, private store: Store<FlowState>) {
  }

  ngOnInit() {
    this.isConfiguratorInitialized$ = this.store.select(TriggerConfigureSelectors.getHasTriggersConfigure);
    const triggerStatuses$ = this.store.select(TriggerConfigureSelectors.getTriggerStatuses);
    this.triggerStatuses$ = this.observeWhileConfiguratorIsActive(triggerStatuses$, []);

    this.isConfiguratorInitialized$
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(isConfigInitialized => {
        this.isOpen = isConfigInitialized;
      });

    const currentTriggerId$ = this.store.select(TriggerConfigureSelectors.selectCurrentTriggerId);
    this.observeWhileConfiguratorIsActive(currentTriggerId$, null)
      .subscribe((currentTriggerId) => {
        this.selectedTriggerId = currentTriggerId;
      });
    const selectedTriggerDetails$ = this.store.select(TriggerConfigureSelectors.getTriggerConfigureDetails);
    this.selectedTriggerDetails$ = this.observeWhileConfiguratorIsActive(selectedTriggerDetails$, {
      tabs: [],
      fields: {}
    });

  }

  changeTriggerSelection(triggerId: string) {
    this.store.dispatch(new TriggerConfigureActions.SelectTrigger(triggerId));
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  onCloseOrDismiss() {
    this.store.dispatch(new TriggerConfigureActions.CloseConfigure());
  }

  onSave() {
    this.triggerConfiguratorService.save();
  }

  private observeWhileConfiguratorIsActive<T>(observable$: Observable<T>, valueWhenNotInitialized: any) {
    return this.isConfiguratorInitialized$.pipe(
      switchMap(isInitialized => isInitialized ? observable$ : of(valueWhenNotInitialized)),
      takeUntil(this.ngDestroy$),
    );
  }


}

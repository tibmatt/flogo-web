import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { switchMap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import { FlowState } from '@flogo/flow/core/state';
import { TriggerConfigureSelectors, TriggerConfigureActions } from '@flogo/flow/core/state/triggers-configure';

import { configuratorAnimations } from './configurator.animations';
import { TriggerStatus } from './interfaces';
import { ConfiguratorService as TriggerConfiguratorService } from './configurator.service';
import { CloseConfigure } from '@flogo/flow/core/state/triggers-configure/trigger-configure.actions';

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
  isConfiguratorInitialized$: Observable<boolean>;
  triggerStatuses$: Observable<TriggerStatus[]>;
  selectedTriggerId: string;
  isOpen: boolean;
  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private triggerConfiguratorService: TriggerConfiguratorService,
    private store: Store<FlowState>,
  ) {
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

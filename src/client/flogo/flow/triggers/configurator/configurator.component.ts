import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfiguratorService as TriggerConfiguratorService} from './configurator.service';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import { configuratorAnimations } from './configurator.animations';
import {ConfiguratorStatus} from './interfaces';

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

  currentConfiguratorState: ConfiguratorStatus = {
    isOpen: false,
    disableSave: true,
    triggers: [],
    selectedTriggerId: null
  };
  private ngDestroy = SingleEmissionSubject.create();

  constructor(private triggerConfiguratorService: TriggerConfiguratorService) {
  }

  ngOnInit() {
    this.triggerConfiguratorService.configuratorStatus$
      .takeUntil(this.ngDestroy)
      .subscribe((nextStatus: ConfiguratorStatus) => this.onNextStatus(nextStatus));
  }

  onNextStatus(nextStatus: ConfiguratorStatus) {
    this.currentConfiguratorState = {
      ...this.currentConfiguratorState,
      ...nextStatus
    };
  }

  changeTriggerSelection(triggerId: string) {
    if (triggerId !== this.currentConfiguratorState.selectedTriggerId) {
      this.triggerConfiguratorService.selectTrigger(triggerId);
    }
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
}

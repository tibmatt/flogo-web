import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfiguratorService as TriggerConfiguratorService} from './configurator.service';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import { configuratorAnimations } from './configurator.animations';
import {ConfigurationStatus, ModalStatus, TriggerStatus} from './interfaces';

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

  currentModalStatus: ModalStatus = {
    isOpen: false,
    flowMetadata: null,
    triggers: [],
    selectedTrigger: null
  };

  selectedTriggerDetails: TriggerStatus;
  disableSave = true;

  triggersList: TriggerStatus[] = [];

  configurableTriggers: Map<string, TriggerStatus> = new Map<string, TriggerStatus>();

  private ngDestroy = SingleEmissionSubject.create();

  constructor(private triggerConfiguratorService: TriggerConfiguratorService) {
  }

  ngOnInit() {
    this.triggerConfiguratorService.modalStatus$
      .takeUntil(this.ngDestroy)
      .subscribe(nextStatus => this.onNextStatus(nextStatus));
    this.triggerConfiguratorService.triggerConfigurationStatus$
      .takeUntil(this.ngDestroy)
      .subscribe(nextStatus => this.onUpdateTriggerConfiguration(nextStatus));
  }

  isSaveDisabled() {
    const allTriggers = Array.from(this.configurableTriggers.values());
    const hasInvalidTriggerMappings = !!allTriggers.find(triggerObj => !triggerObj.isValid);
    const hasModifiedTriggerMapping = !!allTriggers.find(triggerObj => triggerObj.isDirty);
    return !hasModifiedTriggerMapping || hasInvalidTriggerMappings;
  }

  updateAllConfigurationsStates() {
    this.disableSave = this.isSaveDisabled();
    this.triggersList = Array.from(this.configurableTriggers.values());
  }

  onUpdateTriggerConfiguration(nextStatus: ConfigurationStatus) {
    const modifiedTrigger = Object.assign({}, this.configurableTriggers.get(nextStatus.triggerId), {
      isValid: nextStatus.isValid,
      changedMappings: nextStatus.changedMappings
    });
    modifiedTrigger.isDirty = !_.isEqual(modifiedTrigger.changedMappings.actionMappings, modifiedTrigger.handler.actionMappings);
    this.configurableTriggers.set(nextStatus.triggerId, modifiedTrigger);
    this.updateAllConfigurationsStates();
  }

  changeTriggerSelection(triggerId: string) {
    this.currentModalStatus.selectedTrigger = triggerId;
    this.selectedTriggerDetails = this.configurableTriggers.get(triggerId);
  }

  onNextStatus(nextStatus: ModalStatus) {
    this.currentModalStatus = Object.assign({}, nextStatus);
    if (nextStatus.isOpen) {
      this.initConfigurableTriggers();
    } else {
      this.configurableTriggers.clear();
    }
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  onCloseOrDismiss() {
    this.triggerConfiguratorService.close();
  }

  onSave() {
    const modifiedTriggers = [];
    this.configurableTriggers.forEach(configurableTrigger => {
      if (configurableTrigger.isDirty) {
        modifiedTriggers.push({trigger: configurableTrigger.trigger, mappings: configurableTrigger.changedMappings});
      }
    });
    this.triggerConfiguratorService.save(modifiedTriggers);
  }

  initConfigurableTriggers() {
    this.currentModalStatus.triggers.forEach((triggerDetail) => {
      this.configurableTriggers.set(triggerDetail.trigger.id, {
        triggerSchema: triggerDetail.triggerSchema,
        handler: triggerDetail.handler,
        trigger: triggerDetail.trigger,
        isValid: true,
        isDirty: false
      });
    });
    this.selectedTriggerDetails = this.configurableTriggers.get(this.currentModalStatus.selectedTrigger);
    this.updateAllConfigurationsStates();
  }
}

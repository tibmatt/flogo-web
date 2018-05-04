import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfiguratorService as TriggerConfiguratorService} from './configurator.service';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import {ConfigurationStatus, HandlerMappings, ModalStatus} from '@flogo/flow/triggers/configurator/configurator.service';
import {animate, group, state, style, transition, trigger} from '@angular/animations';

interface TriggerStatus {
  handler: any;
  trigger: any;
  triggerSchema: any;
  isValid: boolean;
  isDirty: boolean;
  changedMappings?: HandlerMappings;
}

@Component({
  selector: 'flogo-triggers-configuration',
  templateUrl: 'configurator.component.html',
  styleUrls: [
    '../../../../assets/_mapper-modal.less',
    'configurator.component.less'
  ],
  animations: [
    trigger('configurationPanel', [
      transition('void => *', [
        group([
          style({position: 'fixed', width: '0%', top: '150px'}),
          animate('350ms cubic-bezier(0.4, 0.0, 0.2, 1)')
        ])
      ]),
      transition('* => void', [
        group([
          style({position: 'fixed', bottom: 0, left: 0}),
          animate('350ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({
            width: '40%',
            top: '150px',
            overflow: 'hidden'
          }))
        ])
      ])
    ])
  ]
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

  onUpdateTriggerConfiguration(nextStatus: ConfigurationStatus) {
    const modifiedTrigger = Object.assign({}, this.configurableTriggers.get(nextStatus.triggerId), {
      isValid: nextStatus.isValid,
      changedMappings: nextStatus.changedMappings
    });
    modifiedTrigger.isDirty = !_.isEqual(modifiedTrigger.changedMappings.actionMappings, modifiedTrigger.handler.actionMappings);
    this.configurableTriggers.set(nextStatus.triggerId, modifiedTrigger);
    this.disableSave = this.isSaveDisabled();
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
    this.configurableTriggers.forEach(configurableTrigger => {
      if (configurableTrigger.isDirty) {
        this.triggerConfiguratorService.save(configurableTrigger.trigger, configurableTrigger.changedMappings);
      }
    });
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
    this.disableSave = this.isSaveDisabled();
  }
}

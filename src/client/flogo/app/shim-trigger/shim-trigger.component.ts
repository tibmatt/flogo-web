import {Component, ViewChild, Input, SimpleChanges, OnChanges, EventEmitter, Output} from '@angular/core';
import {BsModalComponent} from 'ng2-bs3-modal';
import {CONTRIB_REF_PLACEHOLDER, LanguageService} from '@flogo/core';


@Component({
  selector: 'flogo-trigger-shim-build',
  templateUrl: 'shim-trigger.component.html',
  styleUrls: ['shim-trigger.component.less']
})

export class TriggerShimBuildComponent implements OnChanges {
  @ViewChild('shimTriggersModal') shimTriggersModal: BsModalComponent;
  @Input() shimTriggersList;
  @Input() buildOptions;
  @Output() triggerSelected: EventEmitter<{ triggerId?: string, env?: {os: string, arch: string}}> = new EventEmitter();
  displayOptions: any;
  isLambdaTrigger: boolean;
  isTriggerSelected: boolean;

  constructor(public translate: LanguageService) {}


  ngOnChanges(changes: SimpleChanges) {
    const change = changes['shimTriggersList'];
    if (change.currentValue) {
      this.shimTriggersList = _.flatMap(this.shimTriggersList, shimTriggerList =>
        _.map(shimTriggerList.flows, flow => _.defaults({configuredTrigger: shimTriggerList.trigger}, {configuredFlow: flow}))
      );
      if (this.shimTriggersList.length === 1) {
        this.displayOptions = {
          triggerName: this.shimTriggersList[0].configuredTrigger.name,
          triggerId: this.shimTriggersList[0].configuredTrigger.id,
          flowName: this.shimTriggersList[0].configuredFlow.name
        };
        this.isTriggerSelected = true;
      } else {
        this.displayOptions = {};
        this.isTriggerSelected = false;
      }
      this.isLambdaTrigger = false;
    }
  }

  openModal() {
    this.shimTriggersModal.open();
  }

  closeModal() {
    this.shimTriggersModal.close();
  }

  onTriggerSelectionFinish(trigger) {
    if (trigger.configuredTrigger.ref === CONTRIB_REF_PLACEHOLDER.REF_LAMBDA) {
      this.isLambdaTrigger = true;
      this.triggerSelected.emit({triggerId: trigger.configuredTrigger.id});
    } else {
      this.displayOptions = {
        triggerName: trigger.configuredTrigger.name,
        triggerId: trigger.configuredTrigger.id,
        flowName: trigger.configuredFlow.name
      };
      this.isTriggerSelected = true;
      this.isLambdaTrigger = false;
    }
  }

  onBuildEnvSelection(env, triggerId) {
    this.triggerSelected.emit({triggerId: triggerId, env: {os: env.os, arch: env.arch}});
  }

}

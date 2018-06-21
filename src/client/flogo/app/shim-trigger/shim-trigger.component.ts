import {Component, ViewChild, Input, SimpleChanges, OnChanges} from '@angular/core';
import {BsModalComponent} from 'ng2-bs3-modal';
import {CONTRIB_REF_PLACEHOLDER, LanguageService} from '@flogo/core';
import {TriggersApiService} from '@flogo/core/services/restapi/v2/triggers-api.service';


@Component({
  selector: 'flogo-trigger-shim-build',
  templateUrl: 'shim-trigger.component.html',
  styleUrls: ['shim-trigger.component.less']
})

export class TriggerShimBuildComponent implements OnChanges {
  @ViewChild('shimTriggersModal') shimTriggersModal: BsModalComponent;
  @Input() shimTriggersList;
  @Input() buildOptions;

  displayOptions: any;
  isLambdaTrigger: boolean;
  buildLink: string;
  serverlessAppBuildLink: HTMLAnchorElement;
  isTriggerSelected: boolean;

  constructor(private triggersApiService: TriggersApiService,
              public translate: LanguageService) {}


  ngOnChanges(changes: SimpleChanges) {
    const change = changes['shimTriggersList'];
    if (change.currentValue) {
      this.shimTriggersList = _.flatMap(this.shimTriggersList, shimTriggerList =>
        _.map(shimTriggerList.flows, flow => _.defaults({configuredTrigger: shimTriggerList.trigger}, {configuredFlow: flow}))
      );
      this.isLambdaTrigger = false;
      this.displayOptions = {};
      this.isTriggerSelected = false;
    }
  }

  openModal() {
    this.shimTriggersModal.open();
  }

  closeModal() {
    this.shimTriggersModal.close();
  }

  buildTrigger(trigger) {
    this.buildLink = this.triggersApiService.getShimTriggerBuildLink(trigger.configuredTrigger.id);
    if (trigger.configuredTrigger.ref === CONTRIB_REF_PLACEHOLDER.REF_LAMBDA) {
      this.isLambdaTrigger = true;
      this.serverlessAppBuildLink = document.createElement('a');
      this.serverlessAppBuildLink.style.display = 'none';
      document.body.appendChild(this.serverlessAppBuildLink);
      this.serverlessAppBuildLink.setAttribute('href', this.buildLink);
      this.serverlessAppBuildLink.click();
      this.closeModal();
    } else {
      this.isLambdaTrigger = false;
      this.isTriggerSelected = true;
      this.displayOptions = {triggerName: trigger.configuredTrigger.name, flowName: trigger.configuredFlow.name};
    }
  }
}

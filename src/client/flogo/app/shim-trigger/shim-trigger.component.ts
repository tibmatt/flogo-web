import {Component, ViewChild, Input, SimpleChanges, OnChanges} from '@angular/core';
import {BsModalComponent} from 'ng2-bs3-modal';


@Component({
  selector: 'flogo-trigger-shim-build',
  templateUrl: 'shim-trigger.component.html',
  styleUrls: ['shim-trigger.component.less']
})

export class TriggerShimBuildComponent implements OnChanges {
  @ViewChild('shimTriggersModal') shimTriggersModal: BsModalComponent;
  @Input() shimTriggersList;


  ngOnChanges(changes: SimpleChanges) {
    const change = changes['shimTriggersList'];
    if (change.currentValue) {
      this.shimTriggersList = _.flatMap(this.shimTriggersList, shimTriggerList =>
        _.map(shimTriggerList.flows, flow => _.defaults({configuredTrigger: shimTriggerList.trigger}, {configuredFlow: flow}))
      );
    }
  }

  openModal() {
    this.shimTriggersModal.open();
  }

  closeModal() {
    this.shimTriggersModal.close();
  }

}

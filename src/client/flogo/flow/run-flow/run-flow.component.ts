import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FlowMetadataAttribute } from '../core/models/flow-metadata-attribute';

@Component({
  selector: 'flogo-run-flow',
  templateUrl: 'run-flow.component.html',
  styleUrls: ['run-flow.component.less']
})

export class FlogoRunFlowComponent {
  @Input()
  flowInputs: FlowMetadataAttribute[];
  @Input()
  disableRun: boolean;
  @Output()
  onSubmit: EventEmitter<FlowMetadataAttribute[]> = new EventEmitter<FlowMetadataAttribute[]>();
  showRunFlow = false;
  runFlowFormGroup: FormGroup;

  get isValid(): boolean {
    return this.runFlowFormGroup && this.runFlowFormGroup.valid;
  }

  setRunFlowFormGroup(formGroup: FormGroup) {
    this.runFlowFormGroup = formGroup;
  }

  /*
  * Run Flow form is not shown when the flow does not have any input metadata for the flow.
  * The Run Flow button should directly run the flow
  */
  handleRunFlowClick() {
    this.flowInputs.length > 0 ? this.showHideRun() : this.onRunFlowSubmit();
  }

  showHideRun() {
    this.showRunFlow = !this.showRunFlow;
  }

  setRunFlowFlag(val: boolean) {
    this.showRunFlow = val;
  }

  onRunFlowSubmit() {
    this.setRunFlowFlag(false);
    this.onSubmit.emit(this.runFlowFormGroup ? this.runFlowFormGroup.value.formFields : []);
  }
}

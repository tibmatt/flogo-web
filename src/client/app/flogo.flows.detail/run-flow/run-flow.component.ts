import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlowMetadataAttribute} from '../models/flow-metadata-attribute';

@Component({
  selector: 'flogo-run-flow',
  templateUrl: 'run-flow.component.html',
  styleUrls: ['run-flow.component.less']
})

export class FlogoRunFlowComponent {
  @Input()
  flowInputs: FlowMetadataAttribute[];
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

  showHideRun() {
    this.showRunFlow = !this.showRunFlow;
  }

  setRunFlowFlag(val: boolean) {
    this.showRunFlow = val;
  }

  onRunFlowSubmit() {
    this.setRunFlowFlag(false);
    this.onSubmit.emit(this.runFlowFormGroup.value.formFields);
  }
}

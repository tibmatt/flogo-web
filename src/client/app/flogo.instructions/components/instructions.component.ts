import { Component, EventEmitter, Input, Output, OnChanges, SimpleChange, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'flogo-instructions',
  // moduleId : module.id,
  templateUrl: 'instructions.tpl.html',
  styleUrls: ['instructions.component.less']
})
export class FlogoInstructionsComponent implements OnChanges {

  @ViewChild('instructionsModal') modal: ModalComponent;

  @Input()
  isActivated: boolean;
  @Output()
  onClosedModal = new EventEmitter();
  steps = [
    { title: 'Configure the trigger', description: '', screenshot: 'flogo.instructions.screen-1@3x.png' },
    { title: 'Add and configure activities', description: '', screenshot: 'flogo.instructions.screen-2@3x.png' },
    { title: 'Run and test at any time', description: '', screenshot: 'flogo.instructions.screen-3@3x.png' },
    { title: 'Build and run', description: '', screenshot: 'flogo.instructions.screen-4@3x.png' }
  ];
  currentIndex: number;
  currentStep: any;
  STEPS_LENGTH = this.steps.length - 1;

  constructor() {
    this.init();
  }

  init() {
    this.currentIndex = 0;
    this.currentStep = this.steps[this.currentIndex];
  }

  clickOption(step: any, index: number) {
    this.currentStep = step;
    this.currentIndex = index;
  }

  clickNext(event) {
    if (this.currentIndex < this.STEPS_LENGTH) {
      this.currentIndex += 1;
    }
    this.currentStep = this.steps[this.currentIndex];
  }

  clickBack(event) {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
    }
    this.currentStep = this.steps[this.currentIndex];
  }


  ngOnChanges(changes: {
    [key: string]: SimpleChange
  }) {

    if (_.has(changes, 'isActivated')) {
      if (changes['isActivated'].currentValue) {
        this.openModal();
      }
    }
  }

  openModal() {
    this.init();
    this.modal.open('lg');
  }

  closeModal() {
    this.modal.close();
    this.onClosedModal.emit(true);
  }

  onModalCloseOrDismiss(event) {
    this.onClosedModal.emit(true);
  }

  onInstallAction(url: string) {
  }
}

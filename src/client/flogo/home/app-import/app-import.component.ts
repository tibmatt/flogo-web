import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';
import { ImportErrorFormatterService } from '../core/import-error-formatter.service';
import {ValidationDetail} from '@flogo/core';


@Component({
  selector: 'flogo-home-app-import',
  templateUrl: 'app-import.component.html',
  styleUrls: ['app-import.component.less']
})
export class FlogoAppImportComponent implements OnChanges {

  @ViewChild('errorModal') modal: BsModalComponent;

  @Input() importValidationErrors: ValidationDetail[];
  @Output() modalClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  errorDetails: ValidationDetail[];

  constructor(public errorFormatter: ImportErrorFormatterService) {
    this.errorDetails = [];
  }

  ngOnChanges(changes: any) {
    this.errorDetails = this.errorFormatter.getErrorsDetails(this.importValidationErrors);
    this.openModal();
  }

  openModal() {
    this.modal.open();
  }

  onModalCloseOrDismiss() {
    this.modalClose.emit(false);
  }


  closeModal() {
    this.modal.close();
    this.onModalCloseOrDismiss();
  }
}

import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ImportErrorFormatterService } from '../services/message.formatter.service';


@Component({
  selector: 'flogo-import-error',
  templateUrl: 'import.error.tpl.html',
  styleUrls: ['import.error.component.less']
})
export class FlogoAppImportErrorComponent implements OnChanges {

  @ViewChild('errorModal') modal: ModalComponent;

  @Input() importValidationErrors: any;
  @Output() modalClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public errorFormatter: ImportErrorFormatterService) {

  }

  ngOnChanges(changes: any) {
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

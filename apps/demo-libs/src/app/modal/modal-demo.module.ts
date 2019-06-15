import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalParentComponent } from './modal-parent.component';
import { ModalContentComponent } from './modal-content.component';

@NgModule({
  imports: [CommonModule],
  exports: [],
  declarations: [ModalParentComponent, ModalContentComponent],
  providers: [],
  entryComponents: [ModalContentComponent],
})
export class ModalDemoModule {}

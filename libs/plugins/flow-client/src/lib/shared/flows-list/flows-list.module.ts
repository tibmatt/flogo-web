import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule as FlogoSharedModule } from '@flogo-web/client/common';
import { FlowsListComponent } from './flows-list.component';

@NgModule({
  imports: [CommonModule, FormsModule, FlogoSharedModule],
  declarations: [FlowsListComponent],
  exports: [FlowsListComponent],
})
export class FlowsListModule {}

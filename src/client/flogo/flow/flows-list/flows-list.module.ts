import {CommonModule} from '@angular/common';
import {CoreModule as FlowCoreModule} from '@flogo/core';
import {NgModule} from '@angular/core';
import {FlowsListComponent} from './flows-list.component';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlowCoreModule
  ],
  declarations: [
    FlowsListComponent
  ],
  exports: [
    FlowsListComponent
  ]
})
export class FlowsListModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { FlogoNewFlowComponent as FlogoFlowsAddComponent } from '../app/new-flow/new-flow.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlogoSharedModule,
  ],
  declarations: [
    FlogoFlowsAddComponent
  ],
  exports: [
    FlogoFlowsAddComponent
  ]
})
export class FlowsModule {}

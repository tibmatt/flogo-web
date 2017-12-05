import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { FlogoNewFlowComponent as FlogoFlowsAddComponent } from '../app/new-flow/new-flow.component';
import { FlogoFlowsFlowNameComponent } from '../flogo.flows.flow-name/components/flow-name.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlogoSharedModule,
  ],
  declarations: [
    FlogoFlowsAddComponent,
    FlogoFlowsFlowNameComponent
  ],
  exports: [
    FlogoFlowsAddComponent,
    FlogoFlowsFlowNameComponent
  ]
})
export class FlowsModule {}

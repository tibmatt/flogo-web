import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';

import { SharedModule as FlogoSharedModule } from '../shared/shared.module';
import { FlogoFlowsAddComponent as FlogoFlowsAddComponent } from '../flogo.flows.add/components/add.component';
import { FlogoFlowsImportComponent as FlogoFlowsImportComponent } from '../flogo.flows.import/components/import-flow.component';
import { FlogoFlowsFlowNameComponent } from '../flogo.flows.flow-name/components/flow-name.component';
import { FooterModule as FlogoFooterModule } from '../flogo.footer/flogo.footer.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlogoSharedModule,
    FlogoFooterModule
  ],
  declarations: [
    FlogoFlowsAddComponent,
    FlogoFlowsImportComponent,
    FlogoFlowsFlowNameComponent
  ],
  exports: [
    FlogoFlowsAddComponent,
    FlogoFlowsImportComponent,
    FlogoFlowsFlowNameComponent
  ]
})
export class FlowsModule {}

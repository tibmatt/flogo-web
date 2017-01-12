import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';

import { InstructionsModule as FlogoInstructionsModule } from '../flogo.instructions/flogo.instructions.module';
import { CommonModule as FlogoCommonModule } from '../../common/common.module'

import { FlogoFlowsComponent }   from './components/flows.component';
import { FlogoFlowsAdd as FlogoFlowsAddComponent } from '../flogo.flows.add/components/add.component';
import { FlogoFlowsImport as FlogoFlowsImportComponent } from '../flogo.flows.import/components/import-flow.component';
import { FlogoFlowsFlowNameComponent } from '../flogo.flows.flow-name/components/flow-name.component';
import { FlogoListComponent } from '../flogo.flows.list/components/flow-list.component';
import { FooterModule as FlogoFooterModule } from '../flogo.footer/flogo.footer.module';

import { routing } from './flogo.flows.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlogoInstructionsModule,
    FlogoCommonModule,
    FlogoFooterModule,
    routing
  ],
  declarations: [
    FlogoFlowsComponent,
    FlogoFlowsAddComponent,
    FlogoFlowsImportComponent,
    FlogoFlowsFlowNameComponent,
    FlogoListComponent,
  ],
  exports:[
    FlogoFlowsComponent,
    FlogoFlowsAddComponent,
    FlogoFlowsImportComponent,
    FlogoFlowsFlowNameComponent,
    FlogoListComponent,
  ]
})
export class FlowsModule {}

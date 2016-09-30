import { NgModule }       from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { ConfigModule } from '../flogo.config/config.module'

import { FlogoAppComponent }   from './components/flogo.component';
import { FlogoNavbarComponent }   from './components/navbar.component';

import { FlogoFlowsComponent }   from '../flogo.flows/components/flows.component';
import { FlogoFlowsAdd as FlogoFlowsAddComponent } from '../flogo.flows.add/components/add.component';
import { FlogoFlowsImport as FlogoFlowsImportComponent } from '../flogo.flows.import/components/import-flow.component';
import { FlogoInstructionsComponent } from '../flogo.instructions/components/instructions.component'

import {routing, appRoutingProviders} from "./flogo.routing";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    ConfigModule,
    routing
  ],
  declarations: [
    FlogoAppComponent,
    FlogoNavbarComponent,

    FlogoFlowsComponent,
    FlogoFlowsAddComponent,
    FlogoFlowsImportComponent,
    FlogoInstructionsComponent

  ],
  bootstrap: [FlogoAppComponent],
  providers: [appRoutingProviders]
})
export class FlogoModule {}

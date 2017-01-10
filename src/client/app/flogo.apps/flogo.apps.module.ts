import { NgModule }       from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { CommonModule as FlogoCommonModule } from '../../common/common.module';

import { FlogoAppsComponent } from './components/apps.component';
import { FlogoMainComponent } from '../flogo.apps.main/components/main.component';
import { FlogoApplicationDetailsComponent } from '../flogo.apps.details/components/details.component';
import { FlogoApplicationFlowsComponent } from '../flogo.apps.flows/components/flows.component';
import { FlogoAppListComponent } from '../flogo.apps.list/components/app.list.component';
import { FlogoApplicationSearch } from '../flogo.apps.search/components/search.component';

import {routing, appRoutingProviders} from "./flogo.apps.routing";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlogoCommonModule,
    routing
  ],
  declarations: [
    FlogoAppsComponent,
    FlogoMainComponent,
    FlogoApplicationDetailsComponent,
    FlogoApplicationFlowsComponent,
    FlogoAppListComponent,
    FlogoApplicationSearch
  ],
  bootstrap: [FlogoAppsComponent],
  providers: [appRoutingProviders]
})
export class FlogoAppsModule {}

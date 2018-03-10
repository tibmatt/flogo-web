import {FormsModule} from '@angular/forms';
import {BsModalModule} from 'ng2-bs3-modal';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FlogoApplicationComponent} from './app.component';
import {FlogoAppSettingsComponent} from '@flogo/app/settings/settings.component';
import {FlogoApplicationDetailComponent} from '@flogo/app/app-detail/app-detail.component';
import {AppDetailService} from '@flogo/app/core/apps.service';
import {FlogoApplicationFlowsComponent} from '@flogo/app/shared/flows/flows.component';
import {FlowGroupComponent} from '@flogo/app/flow-group/flow-group.component';
import {FlogoExportFlowsComponent} from '@flogo/app/export-flows/export-flows.component';
import {FlowTriggerGroupComponent} from '@flogo/app/trigger-group/trigger-group.component';
import {CommonModule} from '@angular/common';
import { SharedModule as FlogoSharedModule } from '../shared/shared.module';
import {FlogoNewFlowComponent} from '@flogo/app/new-flow/new-flow.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BsModalModule,
    FlogoSharedModule,
    RouterModule
  ],
  declarations: [
    FlogoApplicationDetailComponent,
    FlogoApplicationComponent,
    FlogoApplicationFlowsComponent,
    FlowGroupComponent,
    FlogoAppSettingsComponent,
    FlogoExportFlowsComponent,
    FlowTriggerGroupComponent,
    FlogoNewFlowComponent
  ],
  bootstrap: [],
  providers: [
    AppDetailService
  ]
})
export class FlogoApplicationModule {
}


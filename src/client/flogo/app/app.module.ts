import {FormsModule} from '@angular/forms';
import {BsModalModule} from 'ng2-bs3-modal';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FlogoApplicationComponent} from './app.component';
import {FlogoAppSettingsComponent} from './settings/settings.component';
import {FlogoApplicationDetailComponent} from './app-detail/app-detail.component';
import {AppDetailService} from './core/apps.service';
import {FlogoApplicationFlowsComponent} from './shared/flows/flows.component';
import {FlowGroupComponent} from './flow-group/flow-group.component';
import {FlogoExportFlowsComponent} from './export-flows/export-flows.component';
import {FlowTriggerGroupComponent} from './trigger-group/trigger-group.component';
import {CommonModule} from '@angular/common';
import { SharedModule as FlogoSharedModule } from '../shared/shared.module';
import {FlogoNewFlowComponent} from './new-flow/new-flow.component';
import {TriggerShimBuildComponent} from './shim-trigger/shim-trigger.component';
import { AppRoutingModule } from './app-routing.module';
import {ConfirmationService} from '@flogo/core/confirmation/confirmation.service';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BsModalModule,
    FlogoSharedModule,
    RouterModule,
    AppRoutingModule,
    OverlayModule,
    PortalModule,
    ScrollDispatchModule
  ],
  declarations: [
    FlogoApplicationDetailComponent,
    FlogoApplicationComponent,
    FlogoApplicationFlowsComponent,
    FlowGroupComponent,
    FlogoAppSettingsComponent,
    FlogoExportFlowsComponent,
    FlowTriggerGroupComponent,
    FlogoNewFlowComponent,
    TriggerShimBuildComponent
  ],
  bootstrap: [],
  providers: [
    AppDetailService,
    ConfirmationService
  ],
  entryComponents: [
    FlogoExportFlowsComponent
  ]
})
export class FlogoApplicationModule {
}


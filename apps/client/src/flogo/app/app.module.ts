import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ModalService } from '@flogo-web/client-core/modal';
import { SharedModule as FlogoSharedModule } from '@flogo-web/client-shared';

import { AppDetailService, AppResourcesStateService } from './core';
import { FlogoApplicationComponent } from './app.component';
import { FlogoApplicationDetailComponent } from './app-detail/app-detail.component';
import { FlogoExportFlowsComponent } from './export-flows/export-flows.component';
import { FlogoNewFlowComponent } from './new-flow/new-flow.component';
import { TriggerShimBuildComponent } from './shim-trigger/shim-trigger.component';
import { AppRoutingModule } from './app-routing.module';
import { MissingTriggerConfirmationComponent } from './missing-trigger-confirmation';
import {
  ResourceBadgeComponent,
  ResourceComponent,
  ResourceListComponent,
  ResourceViewsSelectorComponent,
  ResourcesGroupByTriggerComponent,
  ResourcesGroupByResourceComponent,
} from './resource-views';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlogoSharedModule,
    RouterModule,
    AppRoutingModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
  ],
  declarations: [
    FlogoApplicationDetailComponent,
    FlogoApplicationComponent,
    ResourceComponent,
    FlogoExportFlowsComponent,
    ResourceViewsSelectorComponent,
    ResourcesGroupByTriggerComponent,
    ResourcesGroupByResourceComponent,
    FlogoNewFlowComponent,
    TriggerShimBuildComponent,
    MissingTriggerConfirmationComponent,
    ResourceBadgeComponent,
    ResourceListComponent,
  ],
  providers: [AppDetailService, AppResourcesStateService, ModalService],
  entryComponents: [
    FlogoExportFlowsComponent,
    TriggerShimBuildComponent,
    FlogoNewFlowComponent,
    MissingTriggerConfirmationComponent,
  ],
})
export class FlogoApplicationModule {}

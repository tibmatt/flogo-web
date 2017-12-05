import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SharedModule as FlogoSharedModule } from '../shared/shared.module';
import { FlowsModule as FlogoFlowsModule } from '../flogo.flows/flogo.flows.module';
import { FlogoHomeComponent } from './home.component';
import { FlogoApplicationComponent } from '../app/app.component';
import { FlogoApplicationDetailComponent } from '../app/app-detail/app-detail.component';
import { FlogoApplicationFlowsComponent, FlowGroupComponent } from '../app/flows/index';
import { FlogoAppsListComponent } from './apps-list/apps-list.component';
import { FlogoAppSettingsComponent } from '../app/settings/settings.component';
import { AppDetailService } from './services/apps.service';
import { FlogoAppImportComponent } from './app-import/app-import.component';
import { ImportErrorFormatterService } from './core/import-error-formatter.service';
import { FlogoNewAppComponent } from './new-app/new-app.component';
import { FlogoExportFlowsComponent } from '../app/app-detail/export-flows/export-flows.component';
import {FlowTriggerGroupComponent} from '../app/flows/flow-group/trigger-group.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlogoFlowsModule,
    FlogoSharedModule,
    RouterModule,
  ],
  declarations: [
    FlogoHomeComponent,
    FlogoApplicationDetailComponent,
    FlogoApplicationComponent,
    FlogoApplicationFlowsComponent,
    FlowGroupComponent,
    FlogoAppsListComponent,
    FlogoAppSettingsComponent,
    FlogoAppImportComponent,
    FlogoNewAppComponent,
    FlogoExportFlowsComponent,
    FlowTriggerGroupComponent
  ],
  bootstrap: [FlogoHomeComponent],
  providers: [
    AppDetailService,
    ImportErrorFormatterService
  ]
})
export class FlogoHomeModule {
}

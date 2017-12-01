import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SharedModule as FlogoSharedModule } from '../shared/shared.module';
import { FlowsModule as FlogoFlowsModule } from '../flogo.flows/flogo.flows.module';
import { FlogoHomeComponent } from './home.component';
import { FlogoApplicationContainerComponent } from '../flogo.apps.details/components/container.component';
import { FlogoApplicationComponent } from '../flogo.apps.details/components/application.component';
import { FlogoApplicationFlowsComponent, FlowGroupComponent } from '../flogo.apps.flows/components';
import { FlogoAppListComponent } from '../flogo.apps.list/components/app.list.component';
import { FlogoApplicationSearchComponent } from '../flogo.apps.search/components/search.component';
import { FlogoAppSettingsComponent } from '../flogo.apps.settings/components/settings.component';
import { AppDetailService } from './services/apps.service';
import { routing, appRoutingProviders } from './home.routing';
import { FlogoAppImportErrorComponent } from '../flogo.apps.import.error/components/import.error.component';
import { ImportErrorFormatterService } from '../flogo.apps.import.error/services/message.formatter.service';
import { ProfileSelectionComponent } from '../flogo.apps.add/components/profile-select.component';
import { FlogoExportFlowsComponent } from '../flogo.apps.details/components/export-flow.component';
import {FlowTriggerGroupComponent} from '../flogo.apps.flows/components/trigger-group.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlogoFlowsModule,
    FlogoSharedModule,
    routing
  ],
  declarations: [
    FlogoHomeComponent,
    FlogoApplicationComponent,
    FlogoApplicationContainerComponent,
    FlogoApplicationFlowsComponent,
    FlowGroupComponent,
    FlogoAppListComponent,
    FlogoApplicationSearchComponent,
    FlogoAppSettingsComponent,
    FlogoAppImportErrorComponent,
    ProfileSelectionComponent,
    FlogoExportFlowsComponent,
    FlowTriggerGroupComponent
  ],
  bootstrap: [FlogoHomeComponent],
  providers: [
    appRoutingProviders,
    AppDetailService,
    ImportErrorFormatterService
  ]
})
export class FlogoHomeModule {
}

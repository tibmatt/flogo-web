import { FormBuilderModule as FlogoFormBuilderModule } from './shared/form-builder';
import { InstallerModule as FlogoInstallerModule } from './shared/installer';
import { TaskMapperModule as FlogoTaskMapperModule } from './task-mapper';

import { EmptyDetailComponent } from './empty-detail/empty-detail.component';
import { FlogoFlowsDetailTriggersComponent } from '../flogo.flows.detail.triggers/components/triggers.component';
import { FlogoFlowsDetailTriggersDetailComponent } from '../flogo.flows.detail.triggers.detail/components/detail.component';
import { FlogoFlowsDetailTasksComponent } from '../flogo.flows.detail.tasks/components/tasks.component';
import { FlogoFlowsDetailTasksDetailComponent } from '../flogo.flows.detail.tasks.detail/components/detail.component';

import { FlogoFlowsDetailTasksInstallComponent } from '../flogo.flows.detail.tasks.install/components/install.component';
import { FlogoFlowsDetailTriggersInstallComponent } from '../flogo.flows.detail.triggers.install/components/install.component';

import { ParamsSchemaModule } from './params-schema';
/////////

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';

import { FormBuilderModule as FlogoCommonFormBuilderModule } from './shared/dynamic-form';
import { FlogoRunFlowComponent } from './run-flow/run-flow.component';

import { CoreModule as FlowCoreModule } from './core';

import { routing } from './flow.routing';
import { FlowComponent } from './flow.component';
import {DiagramModule as FlogoDiagramModule} from '@flogo/flow/shared/diagram';
import {ErrorPanelModule as FlogoFlowErrorPanelModule} from '@flogo/flow/error-panel';
import {TriggersModule as FlogoFlowTriggersModule} from '@flogo/flow/triggers';


@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoLogsModule,

    FlowCoreModule,
    ParamsSchemaModule,

    FlogoFormBuilderModule,
    FlogoInstallerModule,
    FlogoTaskMapperModule,
    FlogoCommonFormBuilderModule,
    FlogoDiagramModule,
    FlogoFlowErrorPanelModule,
    FlogoFlowTriggersModule,
    routing
  ],
  declarations: [
    EmptyDetailComponent,
    FlogoFlowsDetailTriggersComponent,
    FlogoFlowsDetailTriggersDetailComponent,
    FlogoFlowsDetailTasksComponent,
    FlogoFlowsDetailTasksDetailComponent,

    FlogoFlowsDetailTasksInstallComponent,
    FlogoFlowsDetailTriggersInstallComponent,

    FlogoRunFlowComponent,

    ////
    FlowComponent,

  ],
  providers: [],
  bootstrap: [
    FlowComponent
  ]
})
export class FlowModule {
}

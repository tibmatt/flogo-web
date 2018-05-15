import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';
import { DiagramModule } from '@flogo/packages/diagram';

import { FormBuilderModule as FlogoCommonFormBuilderModule } from './shared/dynamic-form';
import { FlogoRunFlowComponent } from './run-flow/run-flow.component';

import { CoreModule as FlowCoreModule } from './core';

import {ErrorPanelModule as FlogoFlowErrorPanelModule} from '@flogo/flow/error-panel';
import {TriggersModule as FlogoFlowTriggersModule} from '@flogo/flow/triggers';
import {TaskDetailModule as FlogoFlowTaskDetailModule} from './task-detail';
import {TaskAddModule as FlogoFlowTaskAddModule} from './task-add';
import { TriggerDetailModule as FlogoFlowTriggerDetailModule } from './trigger-detail';
import { TaskMapperModule as FlogoTaskMapperModule } from './task-configurator';
import { ParamsSchemaModule } from './params-schema';

import { routing } from './flow.routing';
import { FlowComponent } from './flow.component';
import { EmptyDetailComponent } from './empty-detail/empty-detail.component';
import { FlowDataResolver } from './flow-data.resolver';
import { flowReducer } from '@flogo/flow/core/state';
import { StoreModule } from '@ngrx/store';

@NgModule({
  imports: [
    StoreModule.forFeature('flow', flowReducer),
    CommonModule,
    FlogoSharedModule,
    FlogoLogsModule,
    DiagramModule,

    FlowCoreModule,
    ParamsSchemaModule,
    FlogoTaskMapperModule,
    FlogoCommonFormBuilderModule,
    FlogoFlowErrorPanelModule,
    FlogoFlowTriggersModule,
    FlogoFlowTaskDetailModule,
    FlogoFlowTriggerDetailModule,
    FlogoFlowTaskAddModule,
    routing
  ],
  declarations: [
    EmptyDetailComponent,
    FlogoRunFlowComponent,
    FlowComponent,
  ],
  providers: [
    FlowDataResolver,
  ],
  bootstrap: [
    FlowComponent
  ]
})
export class FlowModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';
import { DiagramModule } from '@flogo/packages/diagram';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';

import { FormBuilderModule as FlogoCommonFormBuilderModule } from './shared/dynamic-form';
import { FlogoRunFlowComponent } from './run-flow/run-flow.component';

import { CoreModule as FlowCoreModule } from './core';

import {TriggersModule as FlogoFlowTriggersModule} from '@flogo/flow/triggers';
import {TaskDetailModule as FlogoFlowTaskDetailModule} from './task-detail';
import { TaskMapperModule as FlogoTaskMapperModule } from './task-configurator';
import { BranchMapperModule as FlogoBranchMapperModule } from './branch-configurator';
import { ParamsSchemaModule } from './params-schema';

import { FlowRoutingModule } from './flow-routing.module';
import { FlowComponent } from './flow.component';
import { EmptyDetailComponent } from './empty-detail/empty-detail.component';
import { FlowDataResolver } from './flow-data.resolver';
import { featureReducer } from './core/state';
import { FlogoFlowDiagramComponent } from './flow-diagram/flow-diagram.component';
import { FlowTabsComponent } from './flow-tabs/flow-tabs.component';
import { DebugPanelComponent, DebugPanelDetailComponent } from './debug-panel';
import {TaskAddModule} from './task-add';

@NgModule({
  imports: [
    CommonModule,
    ScrollDispatchModule,
    StoreModule.forFeature('flow', featureReducer),
    FlogoSharedModule,
    FlogoLogsModule,
    DiagramModule,

    FlowCoreModule,
    ParamsSchemaModule,
    FlogoTaskMapperModule,
    FlogoCommonFormBuilderModule,
    FlogoFlowTriggersModule,
    FlogoFlowTaskDetailModule,
    FlowRoutingModule,
    TaskAddModule,
    FlogoBranchMapperModule
  ],
  declarations: [
    EmptyDetailComponent,
    FlogoRunFlowComponent,
    FlowComponent,
    FlogoFlowDiagramComponent,
    FlowTabsComponent,
    DebugPanelComponent,
    DebugPanelDetailComponent,
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

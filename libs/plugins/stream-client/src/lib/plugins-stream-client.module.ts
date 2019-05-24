import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import { ContextPanelModule } from '@flogo-web/lib-client/context-panel';
import { DiagramModule } from '@flogo-web/lib-client/diagram';

import { StreamDataResolver } from './stream-data.resolver';
import { StreamDesignerComponent } from './stream-designer/stream-designer.component';
import { SimulatorComponent } from './simulator/simulator.component';
import { ParamsSchemaModule } from './params-schema';
import { TriggersModule } from './triggers';
import { CoreModule } from './core';
import { StoreModule } from '@ngrx/store';
import { featureReducer } from './core/state';
import { SimulatorVizComponent } from './simulator/simulator-viz.component';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    ContextPanelModule,
    DiagramModule,
    CoreModule,
    StoreModule.forFeature('stream', featureReducer),
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: StreamDesignerComponent,
        resolve: { streamData: StreamDataResolver },
      },
    ]),

    ParamsSchemaModule,
    TriggersModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [StreamDesignerComponent, SimulatorComponent, SimulatorVizComponent],
  providers: [StreamDataResolver],
})
export class PluginsStreamClientModule {}

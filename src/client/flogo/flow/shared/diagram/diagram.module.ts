import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule as FlowCoreModule } from '@flogo/core';
import { FlogoFlowsDetailDiagramComponent } from './diagram.component';

@NgModule({
  imports: [
    CommonModule,
    FlowCoreModule
  ],
  declarations: [
    FlogoFlowsDetailDiagramComponent
  ],
  exports: [
    FlogoFlowsDetailDiagramComponent
  ]
})
export class DiagramModule { }

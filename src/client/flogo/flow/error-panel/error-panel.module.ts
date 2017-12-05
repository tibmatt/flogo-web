import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule as FlowCoreModule } from '@flogo/core';
import {FlogoFlowsDetailErrorPanelComponent} from './error-panel.component';

@NgModule({
  imports: [
    CommonModule,
    FlowCoreModule
  ],
  declarations: [
    FlogoFlowsDetailErrorPanelComponent
  ],
  exports: [
    FlogoFlowsDetailErrorPanelComponent
  ]
})
export class ErrorPanelModule { }

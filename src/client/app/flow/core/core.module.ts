import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RunnerService } from './runner.service';
import { UIModelConverterService } from './ui-model-converter.service';
import { FlogoFlowService } from './flow.service';
// todo: fix
import { FlogoTriggerClickHandlerService } from '../../flogo.flows.detail.triggers-panel/services/click-handler.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    RunnerService,
    UIModelConverterService,
    FlogoFlowService,
    FlogoTriggerClickHandlerService
  ]
})
export class CoreModule { }

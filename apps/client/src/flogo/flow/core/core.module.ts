import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RunOrchestratorService } from './test-runner/run-orchestrator.service';
import { UIModelConverterService } from './ui-model-converter.service';
import { FlogoFlowService } from './flow.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [],
  providers: [
    RunOrchestratorService,
    UIModelConverterService,
    FlogoFlowService
  ]
})
export class CoreModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { RunnerService } from './runner.service';
import { UIModelConverterService } from './ui-model-converter.service';
import { FlogoFlowService } from './flow.service';
import { flowReducer } from './state';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('flow', flowReducer)
  ],
  declarations: [],
  providers: [
    RunnerService,
    UIModelConverterService,
    FlogoFlowService
  ]
})
export class CoreModule { }

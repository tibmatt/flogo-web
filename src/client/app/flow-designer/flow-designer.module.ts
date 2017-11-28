import { NgModule } from '@angular/core';
import { SharedModule } from '@flogo/shared';
import { FormBuilderModule } from './shared/dynamic-form';

@NgModule({
  imports: [
    SharedModule,
    FormBuilderModule,
  ],
  declarations: []
})
export class FlowDesignerModule { }

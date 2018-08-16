import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { SharedModule } from '@flogo/shared';
import { FormBuilderModule as DynamicFormModule } from '@flogo/flow/shared/dynamic-form';
import { DebugPanelComponent } from './debug-panel.component';
import { PanelContentComponent } from './panel-content/panel-content.component';
import { FieldsComponent } from './fields/fields.component';

@NgModule({
  imports: [
    NgCommonModule,
    SharedModule,
    DynamicFormModule
  ],
  declarations: [
    DebugPanelComponent,
    PanelContentComponent,
    FieldsComponent,
  ],
  exports: [
    DebugPanelComponent
  ],
})
export class DebugPanelModule { }

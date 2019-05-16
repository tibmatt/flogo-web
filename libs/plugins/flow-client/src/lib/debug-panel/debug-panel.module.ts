import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { SharedModule } from '@flogo-web/lib-client/common';
import { ContextPanelModule } from '@flogo-web/lib-client/context-panel';

import { FormBuilderModule as DynamicFormModule } from '../shared/dynamic-form';

import { PanelContentComponent } from './panel-content/panel-content.component';
import { FieldsComponent } from './fields/fields.component';
import { ErrorComponent } from './error/error.component';

import { DebugPanelComponent } from './debug-panel.component';

@NgModule({
  imports: [NgCommonModule, SharedModule, DynamicFormModule, ContextPanelModule],
  declarations: [
    PanelContentComponent,
    FieldsComponent,
    ErrorComponent,
    DebugPanelComponent,
  ],
  providers: [],
  exports: [DebugPanelComponent],
})
export class DebugPanelModule {}

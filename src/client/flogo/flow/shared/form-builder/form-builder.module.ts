import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { FlogoConfigurationCommonService as FlogoFormBuilderCommonService } from './configuration/shared/configuration-common.service';
import {
  FlogoFormBuilderFieldsBaseComponent,
  FlogoFormBuilderFieldsListBoxComponent,
  FlogoFormBuilderFieldsNumberComponent,
  FlogoFormBuilderFieldsObjectComponent,
  FlogoFormBuilderFieldsRadioComponent,
  FlogoFormBuilderFieldsTextAreaComponent,
  FlogoFormBuilderFieldsTextBoxComponent
} from './fields';

import {
  FlogoFormBuilderConfigurationTriggerComponent as TriggersDirective
} from './configuration/trigger/trigger.component';
import {
  FlogoFormBuilderConfigurationTaskComponent as TaskDirective
} from './configuration/task/task.component';

import { FlogoFormBuilderComponent } from './form-builder.component';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FormsModule,
    FlogoSharedModule
  ],
  declarations: [
    FlogoFormBuilderFieldsListBoxComponent,
    FlogoFormBuilderFieldsNumberComponent,
    FlogoFormBuilderFieldsObjectComponent,
    FlogoFormBuilderFieldsRadioComponent,
    FlogoFormBuilderFieldsTextAreaComponent,
    FlogoFormBuilderFieldsTextBoxComponent,
    TriggersDirective,
    TaskDirective,
    FlogoFormBuilderComponent
  ],
  exports: [
    FlogoFormBuilderComponent
  ],
  providers: [
    FlogoFormBuilderCommonService
  ]
})
/**
 * @deprecated
 */
export class FormBuilderModule {
}

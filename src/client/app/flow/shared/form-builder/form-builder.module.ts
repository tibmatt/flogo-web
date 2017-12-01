import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { FlogoFormBuilderService as FlogoFormBuilderCommonService } from './form-builder.service';
import {
  FlogoFormBuilderFieldsBaseComponent,
  FlogoFormBuilderFieldsListBoxComponent,
  FlogoFormBuilderFieldsNumberComponent,
  FlogoFormBuilderFieldsObjectComponent,
  FlogoFormBuilderFieldsRadioComponent,
  FlogoFormBuilderFieldsTextAreaComponent,
  FlogoFormBuilderFieldsTextBoxComponent
} from '../../../flogo.form-builder.fields/fields';

import {
  FlogoFormBuilderConfigurationTriggerComponent as TriggersDirective
} from '../../../flogo.form-builder.configuration.trigger/components/form-builder.configuration.trigger.component';
import {
  FlogoFormBuilderConfigurationTaskComponent as TaskDirective
} from '../../../flogo.form-builder.configuration.task/components/form-builder.configuration.task.component';
import {
  FlogoFormBuilderConfigurationBranchComponent as BranchDirective
} from '../../../flogo.form-builder.configuration.branch/components/form-builder.configuration.branch.component';

import { FlogoFormBuilderComponent } from './form-builder.component';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FormsModule,
    FlogoSharedModule
  ],
  declarations: [
    FlogoFormBuilderFieldsBaseComponent,
    FlogoFormBuilderFieldsListBoxComponent,
    FlogoFormBuilderFieldsNumberComponent,
    FlogoFormBuilderFieldsObjectComponent,
    FlogoFormBuilderFieldsRadioComponent,
    FlogoFormBuilderFieldsTextAreaComponent,
    FlogoFormBuilderFieldsTextBoxComponent,
    TriggersDirective,
    TaskDirective,
    BranchDirective,
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TextBoxComponent } from './textbox/textbox.component';
import { FormBuilderComponent } from './form-builder.component';
import { FormBuilderService } from './form-builder.service';
import { FormFieldService } from './form-field.service';
import { NumberComponent } from './number/number.component';
import { TextareaComponent } from './textarea/textarea.component';
import { RadioComponent } from './radio/radio.component';
import { ObjectTypeComponent } from './object/objectType.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    FormBuilderComponent,
    TextBoxComponent,
    NumberComponent,
    TextareaComponent,
    RadioComponent,
    ObjectTypeComponent
  ],
  providers: [
    FormBuilderService,
    FormFieldService
  ],
  exports: [
    FormBuilderComponent
  ]
})
export class FormBuilderModule {
}

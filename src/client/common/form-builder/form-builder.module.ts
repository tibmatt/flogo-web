import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {TextBoxComponent} from './textbox/textbox.component';
import {FormBuilderComponent} from './form-builder.component';
import {FormBuilderService} from './form-builder.service';
import {FormFieldService} from './form-field.service';
import {NumberComponent} from './number/number.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    FormBuilderComponent,
    TextBoxComponent,
    NumberComponent
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

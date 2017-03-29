import { NgModule } from '@angular/core';
import { CommonModule  as NgCommonModule } from '@angular/common';
import { CommonModule as FlogoCommonModule} from '../../common/common.module';
import { FlogoFormTriggerHeader } from '../flogo.form.trigger.header/components/form.trigger.header.component';
import { FlogoForm } from './components/form.component';
import { FlogoFormTrigger } from '../flogo.form.trigger/components/form.trigger.component';

@NgModule({
  imports: [
    NgCommonModule,
    FlogoCommonModule
  ],
  declarations: [
    FlogoForm,
    FlogoFormTrigger,
    FlogoFormTriggerHeader
  ],
  exports: [
    FlogoForm,
    FlogoFormTrigger,
    FlogoFormTriggerHeader
  ],
  providers: []
})
export class FormModule {

}


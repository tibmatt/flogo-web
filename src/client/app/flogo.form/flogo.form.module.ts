import { NgModule } from '@angular/core';
import { CommonModule  as NgCommonModule } from '@angular/common';
import { CommonModule as FlogoCommonModule} from '../../common/common.module';
import { FlogoFormTriggerHeaderComponent } from '../flogo.form.trigger.header/components/form.trigger.header.component';
import { FlogoFormComponent } from './components/form.component';
import { FlogoFormTriggerComponent } from '../flogo.form.trigger/components/form.trigger.component';

@NgModule({
  imports: [
    NgCommonModule,
    FlogoCommonModule
  ],
  declarations: [
    FlogoFormComponent,
    FlogoFormTriggerComponent,
    FlogoFormTriggerHeaderComponent
  ],
  exports: [
    FlogoFormComponent,
    FlogoFormTriggerComponent,
    FlogoFormTriggerHeaderComponent
  ],
  providers: []
})
export class FormModule {

}


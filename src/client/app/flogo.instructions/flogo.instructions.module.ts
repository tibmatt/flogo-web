import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';

import {SharedModule as FlogoSharedModule} from '../shared/shared.module';

import {FlogoInstructionsComponent} from './components/instructions.component';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoSharedModule
  ],
  declarations: [
    FlogoInstructionsComponent
  ],
  exports: [
    FlogoInstructionsComponent
  ],
  providers: [
  ]
})
export class InstructionsModule {
}

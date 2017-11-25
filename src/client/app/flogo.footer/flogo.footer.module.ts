import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';

import {SharedModule as FlogoSharedModule} from '../shared/shared.module';

import {FlogoFooterComponent} from './components/footer.component';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoSharedModule
  ],
  declarations: [
    FlogoFooterComponent
  ],
  exports: [
    FlogoFooterComponent
  ],
  providers: [
  ]
})
export class FooterModule {
}

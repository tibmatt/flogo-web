import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { SharedModule as FlogoSharedModule } from '@flogo-web/client-shared';

import { WalkthroughComponent } from './walkthrough.component';

@NgModule({
  imports: [
    // module dependencies
    NgCommonModule,
    FlogoSharedModule,
  ],
  declarations: [WalkthroughComponent],
  exports: [WalkthroughComponent],
  providers: [],
})
export class WalkthroughModule {}

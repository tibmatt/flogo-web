import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule as FlogoSharedModule} from '@flogo-web/client/shared';

import {FlogoInstallerComponent} from './installer.component';

import { FlogoUrlInstallerComponent } from './url-installer/url-installer.component';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FormsModule,
    FlogoSharedModule
  ],
  declarations: [
    FlogoUrlInstallerComponent,
    FlogoInstallerComponent
  ],
  exports: [
    FlogoInstallerComponent
  ],
  providers: [
  ]
})
export class InstallerModule {
}

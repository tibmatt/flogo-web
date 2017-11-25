import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule as FlogoSharedModule} from '../shared/shared.module';

import {FlogoInstallerComponent} from './components/installer.component';

import { FlogoInstallerUrlComponent } from '../flogo.installer.url-installer/components/url-installer.component';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FormsModule,
    FlogoSharedModule
  ],
  declarations: [
    FlogoInstallerUrlComponent,
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlogoFlowsDetailTasksInstallComponent} from '@flogo/flow/task-add/install/install.component';
import {InstallerModule as ContribInstallerModule} from '@flogo/flow/shared/installer';
import {SharedModule as FlogoSharedModule} from '@flogo/shared';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    ContribInstallerModule
  ],
  declarations: [
    FlogoFlowsDetailTasksInstallComponent
  ],
  exports: [
    FlogoFlowsDetailTasksInstallComponent
  ]
})
export class InstallModule { }

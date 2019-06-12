import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { TranslateModule } from '@ngx-translate/core';
import { InstallerModule as ContribInstallerModule } from '@flogo-web/lib-client/installer';
import { SubFlowModule } from '../sub-flow';
import { AddActivityDirective } from './add-activity.directive';
import { TaskAddComponent } from './task-add.component';
import { AddActivityService } from './add-activity.service';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule,
    TranslateModule,
    ContribInstallerModule,
    SubFlowModule,
  ],
  declarations: [AddActivityDirective, TaskAddComponent],
  providers: [AddActivityService],
  entryComponents: [TaskAddComponent],
  exports: [AddActivityDirective],
})
export class TaskAddModule {}

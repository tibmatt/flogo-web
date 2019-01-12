import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { TranslateModule } from '@ngx-translate/core';

import { InstallerModule } from '../shared/installer';
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
    InstallerModule,
    SubFlowModule,
  ],
  declarations: [AddActivityDirective, TaskAddComponent],
  providers: [AddActivityService],
  entryComponents: [TaskAddComponent],
  exports: [AddActivityDirective],
})
export class TaskAddModule {}

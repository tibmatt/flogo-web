import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';
import {SharedModule as FlogoSharedModule} from '../shared/shared.module';

import {FlogoLogsComponent} from './components/logs.component';
import {SearchPipe} from './components/search.pipe';
import {LogService} from './log.service';
import {FlogoLogsContentComponent} from './components/logs-content.component';
import {FlogoLogsExternalWindowComponent} from './components/logs-external-window.component';
import { routing } from './flogo.logs.routing';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoSharedModule,
    routing
  ],
  declarations: [
    FlogoLogsComponent,
    SearchPipe,
    FlogoLogsContentComponent,
    FlogoLogsExternalWindowComponent
  ],
  exports: [
    FlogoLogsComponent
  ],
  providers: [
    LogService
  ]
})
export class LogsModule {
}

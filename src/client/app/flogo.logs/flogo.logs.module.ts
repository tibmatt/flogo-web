import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';
import {CommonModule as FlogoCommonModule} from '../../common/common.module';

import {FlogoLogs} from './components/logs.component';
import {SearchPipe} from './components/search.pipe';
import {LogService} from './log.service';
import {FlogoLogsContent} from './components/logs-content.component';
import { routing } from './flogo.logs.routing';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoCommonModule,
    routing
  ],
  declarations: [
    FlogoLogs,
    SearchPipe,
    FlogoLogsContent
  ],
  exports: [
    FlogoLogs
  ],
  providers: [
    LogService
  ]
})
export class LogsModule {
}

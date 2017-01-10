import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';

import {CommonModule as FlogoCommonModule} from '../../common/common.module';

import {FlogoLogs} from './components/logs.component';
import {SearchPipe} from './components/search.pipe';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoCommonModule
  ],
  declarations: [
    FlogoLogs,
    SearchPipe
  ],
  exports: [
    FlogoLogs
  ],
  providers: [
  ]
})
export class LogsModule {
}

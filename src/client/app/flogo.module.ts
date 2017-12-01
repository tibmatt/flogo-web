
import { FlogoHomeModule } from '@flogo/home';
import { FlowsModule as FlogoFlowsModule } from './flogo.flows/flogo.flows.module';

import { ConfigModule as FlogoConfigModule } from '@flogo/config';

/////

import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { CoreModule } from '@flogo/core';
import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { FlowModule } from '@flogo/flow';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';

import { FlogoAppComponent } from './flogo.component';
import { appRoutingProviders, routing } from './flogo.routing';

@NgModule({
  imports: [
    BrowserModule,

    // todo: should be in common?
    Ng2Bs3ModalModule,

    CoreModule,
    FlogoSharedModule,
    FlogoHomeModule,
    FlogoLogsModule,
    FlogoFlowsModule,
    FlowModule,
    FlogoConfigModule,
    routing
  ],
  declarations: [
    FlogoAppComponent
  ],
  bootstrap: [FlogoAppComponent],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    appRoutingProviders
  ]
})
export class FlogoModule {
}

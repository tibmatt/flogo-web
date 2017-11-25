import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { SharedModule as FlogoSharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

import { FlogoAppsModule } from './flogo.apps/flogo.apps.module';
import { FlowsModule as FlogoFlowsModule } from './flogo.flows/flogo.flows.module';
import { FlogoFlowsDetailModule } from './flogo.flows.detail/flogo.flows.detail.module';
import { ConfigModule as FlogoConfigModule } from './flogo.config/flogo.config.module';
import { InstructionsModule as FlogoInstructionsModule } from './flogo.instructions/flogo.instructions.module';
import { FooterModule as FlogoFooterModule } from './flogo.footer/flogo.footer.module';

import { FlogoAppComponent } from './flogo.component';
import { appRoutingProviders, routing } from './flogo.routing';

@NgModule({
  imports: [
    BrowserModule,

    // todo: should be in common?
    Ng2Bs3ModalModule,

    CoreModule,
    FlogoSharedModule,
    FlogoAppsModule,
    FlogoFlowsModule,
    FlogoFlowsDetailModule,
    FlogoConfigModule,
    FlogoInstructionsModule,
    FlogoFooterModule,
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

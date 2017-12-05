import { FlowsModule as FlogoFlowsModule } from './flogo.flows/flogo.flows.module';

import { APP_INITIALIZER, NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateLoader, TranslateModule, TranslateService } from 'ng2-translate';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { CoreModule, LanguageService } from '@flogo/core';
import { initializer } from '@flogo/core/initializer';
import { SharedModule as FlogoSharedModule } from '@flogo/shared';

import { FlogoHomeModule } from '@flogo/home';
import { FlowModule } from '@flogo/flow';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';
import { ConfigModule as FlogoConfigModule } from '@flogo/config';

import { appRoutingProviders, routing } from './flogo.routing';
import { FlogoAppComponent } from './flogo.component';
import { CustomTranslateLoader } from '@flogo/core/language';
import { Http } from '@angular/http';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useClass: CustomTranslateLoader,
      deps: [Http]
    }),
    BrowserModule,
    CoreModule,
    // todo: should be in common?
    Ng2Bs3ModalModule,

    FlogoSharedModule,
    FlogoHomeModule,
    FlogoLogsModule,
    FlowModule,
    FlogoConfigModule,
    routing,
  ],
  declarations: [
    FlogoAppComponent
  ],
  bootstrap: [FlogoAppComponent],
  providers: [
    { provide: LanguageService, useExisting: TranslateService },
    { provide: APP_INITIALIZER, useFactory: initializer, deps: [TranslateService], multi: true },
    { provide: APP_BASE_HREF, useValue: '/' },
    appRoutingProviders
  ]
})
export class FlogoModule {
}


import { APP_INITIALIZER, NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { CoreModule, LanguageService } from '@flogo/core';
import { createTranslateLoader } from '@flogo/core/language';
import { initializer } from '@flogo/core/initializer';
import { SharedModule as FlogoSharedModule } from '@flogo/shared';

import { FlogoHomeModule } from '@flogo/home';
import { FlowModule } from '@flogo/flow';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';
import { ConfigModule as FlogoConfigModule } from '@flogo/config';

import { appRoutingProviders, routing } from './flogo.routing';
import { FlogoAppComponent } from './flogo.component';
import { FlogoApplicationModule } from '@flogo/app';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient],
      }
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
    FlogoApplicationModule,
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

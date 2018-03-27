import { APP_INITIALIZER, NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { BsModalModule } from 'ng2-bs3-modal';

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
import { DiagramModule } from '@flogo/packages/diagram';

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
    BrowserAnimationsModule,
    CoreModule,
    // todo: should be in common?
    BsModalModule,

    FlogoSharedModule,
    FlogoHomeModule,
    FlogoLogsModule,
    FlowModule,
    FlogoConfigModule,
    FlogoApplicationModule,
    DiagramModule,
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

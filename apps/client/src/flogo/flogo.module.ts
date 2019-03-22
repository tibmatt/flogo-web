import { APP_INITIALIZER, NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { BsModalModule } from 'ng2-bs3-modal';

import {
  CoreModule as GlobalCoreModule,
  LanguageService,
  FLOGO_VERSION,
} from '@flogo-web/client/core';
import { HOSTNAME } from '@flogo-web/client/core/services';
import { createTranslateLoader } from '@flogo-web/client/core/language';
import { initializer } from '@flogo-web/client/core/initializer';
import { SharedModule as FlogoSharedModule } from '@flogo-web/client-shared';
import { LogsModule as FlogoLogsModule } from '@flogo-web/client-logs';

import { CoreModule as LocalCoreModule, RESOURCE_PLUGINS_CONFIG } from './core';
import { appRoutingProviders, routing } from './flogo.routing';
import { FlogoAppComponent } from './flogo.component';
import { environment } from '../environments/environment';
import { resourcePlugins } from '../plugins';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    !environment.production
      ? StoreDevtoolsModule.instrument({
          maxAge: 25, // Retains last 25 states
          logOnly: environment.production, // Restrict extension to log-only mode
        })
      : [],
    BrowserModule,
    BrowserAnimationsModule,
    GlobalCoreModule,
    LocalCoreModule,
    // todo: should be in common?
    BsModalModule,

    FlogoSharedModule,
    FlogoLogsModule,
    routing,
  ],
  declarations: [FlogoAppComponent],
  bootstrap: [FlogoAppComponent],
  providers: [
    { provide: HOSTNAME, useValue: environment.hostname },
    { provide: FLOGO_VERSION, useValue: environment.version },
    {
      provide: RESOURCE_PLUGINS_CONFIG,
      useValue: resourcePlugins,
    },
    { provide: LanguageService, useExisting: TranslateService },
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      deps: [TranslateService],
      multi: true,
    },
    { provide: APP_BASE_HREF, useValue: '/' },
    appRoutingProviders,
  ],
})
export class FlogoModule {}

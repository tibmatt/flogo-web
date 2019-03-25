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

import { CoreModule as FlogoLibCore, FLOGO_VERSION } from '@flogo-web/lib-client/core';
import { LanguageService } from '@flogo-web/lib-client/language';
import { HOSTNAME } from '@flogo-web/lib-client/core/services';
import { createTranslateLoader } from '@flogo-web/lib-client/language';
import { initializer } from '@flogo-web/lib-client/core/initializer';

import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import { LogsModule as FlogoLogsModule } from '@flogo-web/lib-client/logs';
import { ConfirmationModule as FlogoConfirmationModule } from '@flogo-web/lib-client/confirmation';
import { NotificationsModule as FlogoNotificationsModule } from '@flogo-web/lib-client/notifications';

import { CoreModule, RESOURCE_PLUGINS_CONFIG } from './core';
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
    BrowserModule,
    BrowserAnimationsModule,
    FlogoLibCore,
    CoreModule,
    // todo: should be in common?
    BsModalModule,

    FlogoSharedModule,
    FlogoLogsModule,
    FlogoNotificationsModule,
    FlogoConfirmationModule,
    routing,

    !environment.production
      ? StoreDevtoolsModule.instrument({
          maxAge: 25, // Retains last 25 states
          logOnly: environment.production, // Restrict extension to log-only mode
        })
      : [],
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

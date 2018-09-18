import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import {
  createDefaultRestApiHttpHeaders, DEFAULT_REST_HEADERS, HttpUtilsService, RestApiService,
  TriggersApiService
} from './services/restapi';
import { RESTAPIHandlersService as RESTAPIHandlersServiceV2 } from './services/restapi/v2/handlers-api.service';
import { APIFlowsService } from './services/restapi/v2/flows-api.service';
import { AppsApiService } from './services/restapi/v2/apps-api.service';
import { RunApiService } from './services/restapi/run-api.service';
import { ConfigurationService } from './services/configuration.service';
import { SanitizeService } from './services/sanitize.service';
import { ErrorService } from './services/error.service';
import { WindowRef } from './services/window-ref';
import { ChildWindowService } from './services/child-window.service';
import { FlowsService } from './services/flows.service';
import { ProfilesAPIService } from './services/restapi/v2/profiles-api.service';
import { FlogoProfileService } from './services/profile.service';
import { RESTAPIContributionsService } from './services/restapi/v2/contributions.service';
import { SvgRefFixerService } from './services/svg-ref-fixer.service';
import { LogService } from '@flogo/core/services/log.service';
import { FlogoNavbarComponent } from './navbar/navbar.component';
import { WalkthroughModule } from './walkthrough/walkthrough.module';
import { ShimTriggerBuildApiService } from './services/restapi/v2/shim-trigger-build-api.service';
import { FileDownloaderService } from './services/file-downloader.service';
import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {ConfirmationModalComponent} from '@flogo/core/confirmation/confirmation-modal/confirmation-modal.component';
import {ConfirmationService} from '@flogo/core/confirmation/confirmation.service';
import {OverlayModule} from '@angular/cdk/overlay';
import {ConfirmationModalService} from './confirmation/confirmation-modal/confirmation-modal.service';
import { NotificationsModule } from './notifications';

@NgModule({
  imports: [
    HttpClientModule,
    RouterModule,
    OverlayModule,
    WalkthroughModule,
    TranslateModule,
    FlogoSharedModule,
    NotificationsModule,
  ],
  providers: [ // services
    { provide: DEFAULT_REST_HEADERS, useValue: createDefaultRestApiHttpHeaders() },
    HttpUtilsService,
    RestApiService,

    TriggersApiService,
    ShimTriggerBuildApiService,

    RESTAPIHandlersServiceV2,
    AppsApiService,
    APIFlowsService,
    ProfilesAPIService,
    RESTAPIContributionsService,

    RunApiService,
    ChildWindowService,
    ErrorService,
    ConfigurationService,
    SanitizeService,
    WindowRef,
    FlowsService,
    FlogoProfileService,
    LogService,
    SvgRefFixerService,
    FileDownloaderService,
    ConfirmationService,
    ConfirmationModalService
  ],
  declarations: [
    FlogoNavbarComponent,
    ConfirmationModalComponent
  ],
  exports: [
    FlogoNavbarComponent,
    NotificationsModule,
  ],
  entryComponents: [
    ConfirmationModalComponent
  ]
})
export class CoreModule {
}

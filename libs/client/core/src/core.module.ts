import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';

import {
  createDefaultRestApiHttpHeaders,
  DEFAULT_REST_HEADERS,
  HttpUtilsService,
  RestApiService,
  TriggersApiService,
} from './services/restapi';
import { RESTAPIHandlersService as RESTAPIHandlersServiceV2 } from './services/restapi/v2/handlers-api.service';
import { APIFlowsService } from './services/restapi/v2/flows-api.service';
import { AppsApiService } from './services/restapi/v2/apps-api.service';
import { ConfigurationService } from './services/configuration.service';
import { ErrorService, WindowRef, SanitizeService, RunApiService } from './services';
import { ChildWindowService } from './services/child-window.service';
import { FlowsService } from './services/flows.service';
import { FlogoProfileService } from './services/profile.service';
import { RESTAPIContributionsService } from './services/restapi/v2/contributions.service';
import { SvgRefFixerService } from './services/svg-ref-fixer.service';
import { LogService } from './services/log.service';
import { FlogoNavbarComponent } from './navbar/navbar.component';
import { WalkthroughModule } from './walkthrough/walkthrough.module';
import { ShimTriggerBuildApiService } from './services/restapi/v2/shim-trigger-build-api.service';
import { FileDownloaderService } from './services/file-downloader.service';
import { ConfirmationModalComponent, ConfirmationModalService, ConfirmationService  } from './confirmation';
import { NotificationsModule } from './notifications';
import { ModalService } from './modal';

import { SharedModule as FlogoSharedModule } from '../../../../apps/client/src/flogo/shared';

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
  providers: [
    // services
    {
      provide: DEFAULT_REST_HEADERS,
      useValue: createDefaultRestApiHttpHeaders(),
    },
    HttpUtilsService,
    RestApiService,

    TriggersApiService,
    ShimTriggerBuildApiService,

    RESTAPIHandlersServiceV2,
    AppsApiService,
    APIFlowsService,
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
    ConfirmationModalService,
    ModalService,
  ],
  declarations: [FlogoNavbarComponent, ConfirmationModalComponent],
  exports: [FlogoNavbarComponent, NotificationsModule],
  entryComponents: [ConfirmationModalComponent],
})
export class CoreModule {}

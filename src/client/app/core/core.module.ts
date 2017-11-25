import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { TranslateModule } from 'ng2-translate';

import { RESTAPIApplicationsService } from './services/restapi/applications-api.service';
import { RESTAPIActivitiesService } from './services/restapi/activities-api.service';
import { RESTAPIConfigurationService } from './services/restapi/configuration-api-service';
import { RESTAPIFlowsService } from './services/restapi/flows-api.service';
import { RESTAPITriggersService } from './services/restapi/triggers-api.service';
import { RESTAPITriggersService as RESTAPITriggersServiceV2 } from './services/restapi/v2/triggers-api.service';
import { RESTAPIHandlersService as RESTAPIHandlersServiceV2 } from './services/restapi/v2/handlers-api.service';
import { APIFlowsService } from './services/restapi/v2/flows-api.service';
import { AppsApiService } from './services/restapi/v2/apps-api.service';
import { RunService } from './services/restapi/run.service';
import { HttpUtilsService } from './services/restapi/http-utils.service';
import { FlogoModal } from './services/modal.service';
import { ConfigurationService } from './services/configuration.service';
import { PostService } from './services/post.service';
import { SanitizeService } from './services/sanitize.service';
import { ConfigurationLoadedGuard } from './services/configuration-loaded-guard.service';
import { LoadingStatusService } from './services/loading-status.service';
import { LanguageService } from './services/language.service';
import { ErrorService } from './services/error.service';
import { WindowRef } from './services/window-ref';
import { ChildWindowService } from './services/child-window.service';
import { FlowsService } from './services/flows.service';
import { ProfilesAPIService } from './services/restapi/v2/profiles-api.service';
import { FlogoProfileService } from './services/profile.service';
import { RESTAPIContributionsService } from './services/restapi/v2/contributions.service';
import { FlogoMicroserviceTaskIdGeneratorService } from './services/profiles/microservices/utils.service';
import { FlogoDeviceTaskIdGeneratorService } from './services/profiles/devices/utils.service';
import { FlogoNavbarComponent } from './navbar/navbar.component';
import { InstructionsModule } from '../flogo.instructions/flogo.instructions.module';

@NgModule({
  imports: [
    HttpModule,
    RouterModule,
    TranslateModule,
    InstructionsModule,
  ],
  providers: [ // services
    RESTAPIApplicationsService,
    RESTAPIActivitiesService,
    RESTAPIConfigurationService,
    RESTAPIFlowsService,

    RESTAPITriggersService,
    RESTAPITriggersServiceV2,
    RESTAPIHandlersServiceV2,
    AppsApiService,
    APIFlowsService,
    ProfilesAPIService,
    RESTAPIContributionsService,

    RunService,
    ChildWindowService,
    HttpUtilsService,
    ErrorService,
    FlogoModal,
    ConfigurationService,
    PostService,
    SanitizeService,
    ConfigurationLoadedGuard,
    LoadingStatusService,
    LanguageService,
    WindowRef,
    FlowsService,
    FlogoProfileService,
    FlogoMicroserviceTaskIdGeneratorService,
    FlogoDeviceTaskIdGeneratorService
  ],
  declarations: [
    FlogoNavbarComponent,
  ],
  exports: [
    FlogoNavbarComponent,
  ]
})
export class CoreModule {
}

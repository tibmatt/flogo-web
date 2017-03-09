import { NgModule } from '@angular/core';

import {RESTAPIApplicationsService} from './services/restapi/applications-api.service';
import {RESTAPIActivitiesService} from './services/restapi/activities-api.service';
import {RESTAPIConfigurationService} from './services/restapi/configuration-api-service';
import {RESTAPIFlowsService} from './services/restapi/flows-api.service';
import {RESTAPITriggersService} from './services/restapi/triggers-api.service';
import { RunService } from './services/restapi/run.service';
import { HttpUtilsService } from './services/restapi/http-utils.service';
import {FlogoModal} from './services/modal.service';
import {ConfigurationService} from './services/configuration.service';
import {PostService} from './services/post.service';
import {ConfigurationLoadedGuard} from './services/configuration-loaded-guard.service';
import {LoadingStatusService} from './services/loading-status.service';
import { LanguageService } from './services/language.service';
import { ErrorService } from './services/error.service';
import { WindowRef } from './services/window-ref';
import { ChildWindowService } from './services/child-window.service';

@NgModule({
  providers: [ // services
    RESTAPIApplicationsService,
    RESTAPIActivitiesService,
    RESTAPIConfigurationService,
    RESTAPIFlowsService,
    RESTAPITriggersService,
    RunService,
    ChildWindowService,
    HttpUtilsService,
    ErrorService,
    FlogoModal,
    ConfigurationService,
    PostService,
    ConfigurationLoadedGuard,
    LoadingStatusService,
    LanguageService,
    WindowRef
  ]
})
export class CoreModule { }

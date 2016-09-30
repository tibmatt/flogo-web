import { NgModule }      from '@angular/core';

import {RESTAPIActivitiesService} from './services/restapi/activities-api.service';
import {RESTAPIConfigurationService} from './services/restapi/configuration-api-service';
import {RESTAPIFlowsService} from './services/restapi/flows-api.service';
import {RESTAPITriggersService} from './services/restapi/triggers-api.service';
import {FlogoModal} from './services/modal.service';
import {ConfigurationService} from './services/configuration.service';
import {FlogoDBService} from './services/db.service';
import {PostService} from './services/post.service';
import {ConfigurationLoadedGuard} from './services/configuration-loaded-guard.service';

@NgModule({
  providers: [ // services
    RESTAPIActivitiesService,
    RESTAPIConfigurationService,
    RESTAPIFlowsService,
    RESTAPITriggersService,
    FlogoModal,
    ConfigurationService,
    FlogoDBService,
    PostService,
    ConfigurationLoadedGuard
  ]
})
export class CoreModule { }

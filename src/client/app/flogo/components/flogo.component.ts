import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {FlogoNavbarComponent} from './navbar.component';
import {FlogoFlowsComponet} from '../../flogo.flows/components/flows.component';
import {FlogoCanvasComponent} from '../../flogo.flows.detail/components/canvas.component';
import {FlogoFormBuilderComponent} from "../../flogo.form-builder/components/form-builder.component";
import {PostService} from '../../../common/services/post.service';
import { FlogoDBService } from '../../../common/services/db.service';
import { RESTAPIService } from '../../../common/services/rest-api.service';
import { HTTP_PROVIDERS } from 'angular2/http';
import { RESTAPITest } from '../../../common/services/rest-api-test.spec';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';
import { RESTAPIActivitiesService } from '../../../common/services/restapi/activities-api.service';
import { Flogo_ConfigComponent } from '../../flogo._config/components/_config.components';

@Component({
  selector: 'flogo-app',
  moduleId: module.id,
  templateUrl: 'flogo.tpl.html',
  styleUrls: [ 'flogo.component.css' ],
  directives: [ROUTER_DIRECTIVES, FlogoNavbarComponent],
  providers: [PostService,FlogoDBService, RESTAPIService, RESTAPIFlowsService, RESTAPIActivitiesService, HTTP_PROVIDERS]
})

@RouteConfig([
  {
    path: '/', name: "FlogoHome", component:FlogoFlowsComponet
  },
  {
    path: '/flows', name: "FlogoFlows", component:FlogoFlowsComponet, useAsDefault: true
  },
  {
    path:'/flows/:id/...', name:"FlogoFlowDetail", component: FlogoCanvasComponent
  },
  {
    path:'/task', name: 'FlogoTask', component: FlogoFormBuilderComponent
  },
  {
    path:'/rest-api-test', name: 'FlogoRESTAPITest', component: RESTAPITest
  },
  // TODO
  //  temp config page to change server URL settings
  {
    path: '/_config', name: "FlogoDevConfig", component:Flogo_ConfigComponent
  },
])

export class FlogoAppComponent{
  constructor(){
  }

}

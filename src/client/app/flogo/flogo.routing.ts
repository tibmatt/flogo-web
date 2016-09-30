import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlogoFlowsComponent } from "../flogo.flows/components/flows.component";
import { FlogoCanvasComponent } from "../flogo.flows.detail/components/canvas.component";
import { FlogoFormBuilderComponent } from "../flogo.form-builder/components/form-builder.component";
import { RESTAPITest } from "../../common/services/rest-api-test.spec";
import { FlogoConfigComponent } from "../flogo.config/components/config.component";

import { ConfigurationLoadedGuard } from '../../common/services/configuration-loaded-guard.service';

export const appRoutes: Routes = [
  /*{
    path: 'flows',
    canActivate: [ ConfigurationLoadedGuard ],
    //name: "FlogoFlows",
    component: FlogoFlowsComponent,
    //useAsDefault: true
  },
  {
    path: 'flows/:id/...',
    canActivate: [ ConfigurationLoadedGuard ],
    //name:"FlogoFlowDetail",
    component: FlogoCanvasComponent
  },
  {
    path: 'task',
    //name: 'FlogoTask',
    component: FlogoFormBuilderComponent
  },
  {
    path: 'rest-api-test',
    //name: 'FlogoRESTAPITest',
    component: RESTAPITest
  },*/
  // TODO
  //  temp config page to change server URL settings
  {
    path: '_config',
    //name: "FlogoDevConfig",
    canActivate: [ ConfigurationLoadedGuard ],
    component: FlogoConfigComponent
  },
  {
    path: '',
    canActivate: [ ConfigurationLoadedGuard ],
    component: FlogoFlowsComponent
    //name: "FlogoHome",
  }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

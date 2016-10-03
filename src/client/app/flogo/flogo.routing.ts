import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlogoFlowsComponent } from "../flogo.flows/components/flows.component";
import { FlogoConfigComponent } from "../flogo.config/components/config.component";

import { ConfigurationLoadedGuard } from '../../common/services/configuration-loaded-guard.service';

export const appRoutes: Routes = [
  {
    path: 'flows',
    canActivate: [ ConfigurationLoadedGuard ],
    //name: "FlogoFlows",
    loadChildren: '/app/flogo.flows/flogo.flows.module#FlowsModule'//,
    //component: FlogoFlowsComponent,
    //useAsDefault: true
  },
  {
    path: 'flows/:id',
    canActivate: [ ConfigurationLoadedGuard ],
    //name:"FlogoFlowDetail",
    loadChildren: '/app/flogo.flows.detail/flogo.flows.detail.module#FlogoFlowsDetailModule'
    //component: FlogoCanvasComponent
  },
  {
    path: '_config',
    //name: "FlogoDevConfig",
    loadChildren: '/app/flogo.config/flogo.config.module#ConfigModule',
    canActivate: [ ConfigurationLoadedGuard ],
    //component: FlogoConfigComponent
  },
  {
    path: '',
    redirectTo: 'flows',
    pathMatch: 'full'
    //name: "FlogoHome",
  }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

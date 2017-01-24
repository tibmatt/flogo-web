import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfigurationLoadedGuard } from '../../common/services/configuration-loaded-guard.service';
import { FlogoAppsComponent } from './components/apps.component';
import { FlogoMainComponent } from '../flogo.apps.main/components/main.component';
import { FlogoApplicationContainerComponent } from '../flogo.apps.details/components/container.component';

const routes: Routes = [
  {
    path: 'apps',
    component: FlogoAppsComponent,
    canActivate: [ ConfigurationLoadedGuard ],
    children: [
      { path: '', component: FlogoMainComponent },
      { path: ':appId', component: FlogoApplicationContainerComponent }
    ]
  }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

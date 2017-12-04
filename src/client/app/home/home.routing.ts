import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationLoadedGuard } from '../core/services/configuration-loaded-guard.service';
import { FlogoHomeComponent } from './home.component';
import { FlogoApplicationComponent } from '../app/app.component';

const routes: Routes = [
  {
    path: 'apps',
    component: FlogoHomeComponent,
    // canActivate: [ConfigurationLoadedGuard],
  },
  {
    path: 'apps/:appId',
    component: FlogoApplicationComponent
  }
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

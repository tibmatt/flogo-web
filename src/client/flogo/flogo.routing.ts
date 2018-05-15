import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExternalWindowComponent } from '@flogo/logs';
import { FlogoHomeComponent } from '@flogo/home';
import { FlogoApplicationComponent } from '@flogo/app';

export const appRoutes: Routes = [
  {
    path: 'apps',
    component: FlogoHomeComponent,
    // canActivate: [ConfigurationLoadedGuard],
  },
  {
    path: 'apps/:appId',
    component: FlogoApplicationComponent
  },
  {
    path: 'logs',
    component: ExternalWindowComponent
  },
  {
    path: '**',
    redirectTo: 'apps',
    pathMatch: 'full'
  }
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

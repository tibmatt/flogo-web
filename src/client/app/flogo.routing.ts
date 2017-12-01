import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExternalWindowComponent } from '@flogo/logs';

export const appRoutes: Routes = [
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

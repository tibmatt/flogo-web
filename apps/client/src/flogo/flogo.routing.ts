import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ExternalWindowComponent } from '@flogo-web/client-logs';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: './home/home.module#FlogoHomeModule',
  },
  {
    path: 'apps',
    loadChildren: './app/app.module#FlogoApplicationModule',
  },
  {
    path: 'logs',
    component: ExternalWindowComponent,
  },
  {
    path: 'flows',
    loadChildren: '@flogo-web/plugins/flow-client#FlowModule',
  },
  {
    path: '_config',
    loadChildren: './config/config.module#ConfigModule',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
  preloadingStrategy: PreloadAllModules,
});

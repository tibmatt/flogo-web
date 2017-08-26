
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlogoLogsExternalWindowComponent } from './components/logs-external-window.component';

const routes: Routes = [
  {
    path: 'logs',
    component: FlogoLogsExternalWindowComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

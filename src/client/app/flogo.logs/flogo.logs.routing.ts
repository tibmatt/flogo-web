
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlogoLogsExternalWindow } from './components/logs-external-window.component';

const routes: Routes = [
  {
    path: 'logs',
    component: FlogoLogsExternalWindow
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

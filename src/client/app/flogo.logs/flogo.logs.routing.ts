
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlogoLogsContent } from './components/logs-content.component';

const routes: Routes = [
  {
    path: 'logs',
    component: FlogoLogsContent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

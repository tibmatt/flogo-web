import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlogoConfigComponent } from './config.component';

const routes: Routes = [
  {
    path: '_config',
    component: FlogoConfigComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

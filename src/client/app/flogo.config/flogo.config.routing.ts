import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlogoConfigComponent } from './components/config.component';

const routes: Routes = [
  {
    path: '',
    component: FlogoConfigComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

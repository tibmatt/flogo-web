import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlogoFlowsComponent } from './components/flows.component';

const routes: Routes = [
  {
    path: '',
    component: FlogoFlowsComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

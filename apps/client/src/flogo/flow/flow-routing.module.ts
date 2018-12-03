import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FlowComponent } from './flow.component';
import { FlowDataResolver } from './flow-data.resolver';

const flowRoutes: Routes = [
  {
    path: ':id',
    component: FlowComponent,
    resolve: {
      flowData: FlowDataResolver,
    },
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(flowRoutes)],
  exports: [RouterModule],
})
export class FlowRoutingModule {}

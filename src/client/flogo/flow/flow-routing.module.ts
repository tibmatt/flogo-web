import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EmptyDetailComponent } from './empty-detail/empty-detail.component';
import { FlogoFlowsDetailTasksComponent } from './task-add';
import { FlogoFlowsDetailTasksDetailComponent } from './task-detail';
import { FlowComponent } from './flow.component';
import { FlowDataResolver } from './flow-data.resolver';

const flowRoutes: Routes = [
  {
    path: ':id',
    component: FlowComponent,
    resolve: {
      flowData: FlowDataResolver,
    },
    children: [
      { path: '', component: EmptyDetailComponent },
      { path: 'task/add', component: FlogoFlowsDetailTasksComponent },
      { path: 'task/:id', component: FlogoFlowsDetailTasksDetailComponent }
    ]
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(flowRoutes)],
  exports: [RouterModule]
})
export class FlowRoutingModule {}


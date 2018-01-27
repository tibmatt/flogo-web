import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EmptyDetailComponent } from './empty-detail/empty-detail.component';
import { FlogoFlowsDetailTriggersDetailComponent } from './trigger-detail';
import { FlogoFlowsDetailTasksComponent } from './task-add';
import { FlogoFlowsDetailTasksDetailComponent } from './task-detail';
import { FlowComponent } from './flow.component';
import { FlowDataResolver } from './flow-data.resolver';

export const routes: Routes = [
  {
    path: 'flows/:id',
    component: FlowComponent,
    resolve: {
      flowData: FlowDataResolver,
    },
    children: [
      { path: '', component: EmptyDetailComponent },
      { path: 'trigger/:id', component: FlogoFlowsDetailTriggersDetailComponent },
      { path: 'task/add', component: FlogoFlowsDetailTasksComponent },
      { path: 'task/:id', component: FlogoFlowsDetailTasksDetailComponent }
      // {path: 'logs', component: LogsComponent}
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

/*
{path: '/', name: 'FlogoFlowsDetailDefault', component: EmptyDetailComponent, useAsDefault: true},
{path: '/trigger/:id', name: 'FlogoFlowsDetailTriggerDetail', component: FlogoFlowsDetailTriggersDetailComponent},
{path: '/task/add', name: 'FlogoFlowsDetailaskAdd', component: FlogoFlowsDetailTasksComponent},
{path: '/task/:id', name: 'FlogoFlowsDetailTaskDetail', component: FlogoFlowsDetailTasksDetailComponent}*/

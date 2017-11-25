import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfigurationLoadedGuard } from '../core/services/configuration-loaded-guard.service';

import { FlogoFlowsDetailComponent } from './components';
import { FlogoFlowsDetailTriggersComponent } from '../flogo.flows.detail.triggers/components/triggers.component';
import { FlogoFlowsDetailTriggersDetailComponent } from '../flogo.flows.detail.triggers.detail/components/detail.component';
import { FlogoFlowsDetailTasksComponent } from '../flogo.flows.detail.tasks/components/tasks.component';
import { FlogoFlowsDetailTasksDetailComponent } from '../flogo.flows.detail.tasks.detail/components/detail.component';
import { FlogoCanvasComponent } from './components/canvas.component';
import { FlogoFormComponent } from './../flogo.form/components/form.component';

export const routes: Routes = [
  {
    path: 'flows/:id',
    component: FlogoCanvasComponent,
    canActivate: [ConfigurationLoadedGuard],
    children: [
      { path: '', component: FlogoFlowsDetailComponent },
      { path: 'trigger/add', component: FlogoFlowsDetailTriggersComponent },
      { path: 'trigger/:id', component: FlogoFlowsDetailTriggersDetailComponent },
      { path: 'task/add', component: FlogoFlowsDetailTasksComponent },
      { path: 'task/:id', component: FlogoFlowsDetailTasksDetailComponent },
      { path: 'new-trigger', component: FlogoFormComponent }
      // {path: 'logs', component: FlogoLogsComponent}
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);

/*
{path: '/', name: 'FlogoFlowsDetailDefault', component: FlogoFlowsDetailComponent, useAsDefault: true},
{path: '/trigger/add', name: 'FlogoFlowsDetailTriggerAdd', component: FlogoFlowsDetailTriggersComponent},
{path: '/trigger/:id', name: 'FlogoFlowsDetailTriggerDetail', component: FlogoFlowsDetailTriggersDetailComponent},
{path: '/task/add', name: 'FlogoFlowsDetailaskAdd', component: FlogoFlowsDetailTasksComponent},
{path: '/task/:id', name: 'FlogoFlowsDetailTaskDetail', component: FlogoFlowsDetailTasksDetailComponent}*/

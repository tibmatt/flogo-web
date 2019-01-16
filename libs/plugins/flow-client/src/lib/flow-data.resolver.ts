import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedResourceRoute } from '@flogo-web/client-core';

import { FlogoFlowService, FlowData } from './core';

@Injectable()
export class FlowDataResolver implements Resolve<FlowData> {
  constructor(
    private flowService: FlogoFlowService,
    private activatedResource: ActivatedResourceRoute
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    // todo: directly pass the resource as it has already been loaded
    return this.flowService.loadFlow(this.activatedResource.resourceId);
  }
}

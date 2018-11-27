import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { FlogoFlowService } from '@flogo-web/client/flow/core';
import { FlowData } from './core';

@Injectable()
export class FlowDataResolver implements Resolve<FlowData> {

  constructor(private flowService: FlogoFlowService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const flowId = route.params['id'];
    return this.flowService.loadFlow(flowId);
  }

}

import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedResourceRoute } from '@flogo-web/lib-client/core';
import { FlogoFlowService, ResourceFlowData } from './core';

@Injectable()
export class StreamDataResolver implements Resolve<any> {
  constructor(
    private streamService: FlogoFlowService,
    private activatedResource: ActivatedResourceRoute<ResourceFlowData>
  ) {}

  resolve() {
    return this.streamService.loadFlow(this.activatedResource.resource);
  }
}

import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedResourceRoute } from '@flogo-web/lib-client/core';
import { StreamService } from './core/stream.service';

@Injectable()
export class StreamDataResolver implements Resolve<any> {
  constructor(
    private streamService: StreamService,
    private activatedResource: ActivatedResourceRoute
  ) {}

  resolve() {
    return this.streamService.loadStream(this.activatedResource.resource);
  }
}

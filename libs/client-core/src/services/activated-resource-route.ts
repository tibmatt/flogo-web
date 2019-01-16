import { Injectable } from '@angular/core';
import { Resource } from '@flogo-web/core';

@Injectable({
  providedIn: 'root',
})
export class ActivatedResourceRoute {
  resourceId: string | null;
  resource: Resource | null;
  configure(resourceId: string, resource: Resource) {
    this.resourceId = resourceId;
    this.resource = resource;
  }

  clear() {
    this.resourceId = null;
    this.resource = null;
  }
}

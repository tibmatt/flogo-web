import { Injectable } from '@angular/core';
import { Resource } from '@flogo-web/core';
import { RestApiService } from '../rest-api.service';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  constructor(private restApi: RestApiService) {}

  getResource(resourceId: string) {
    return this.restApi.get<Resource>(`resources/${resourceId}`);
  }
}

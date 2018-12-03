import { Injectable } from '@angular/core';
import { RestApiService } from '../rest-api.service';

@Injectable()
export class ProfilesAPIService {
  constructor(private restApiService: RestApiService) {}

  getProfilesList() {
    return this.restApiService.get<{ type: string; id: string }[]>('profiles').toPromise();
  }
}

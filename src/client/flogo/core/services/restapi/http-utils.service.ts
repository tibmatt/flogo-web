import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

export const domainURL = environment.hostname;
export const API_PREFIX = domainURL + '/v1/api/';
export const API_PREFIX_V2 = domainURL + '/api/v2/';

@Injectable()
export class HttpUtilsService {
  constructor() {
  }

  apiPrefix(path?: string, version?: 'v1'|'v2') {
    const prefix = version === 'v1' ? API_PREFIX : API_PREFIX_V2;
    return `${prefix}${path}`;
  }

}

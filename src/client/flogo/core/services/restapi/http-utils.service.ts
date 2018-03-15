import { Injectable } from '@angular/core';
import { Headers, RequestOptions, RequestOptionsArgs } from '@angular/http';
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

  defaultOptions(extendOptions?: RequestOptionsArgs): RequestOptions {
    const options = Object.assign(
      {},
      { headers: new Headers({ 'Accept': 'application/json' }) },
      extendOptions || {}
    );
    return new RequestOptions(options);
  }

}

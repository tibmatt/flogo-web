import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import {environment} from "../../../environments/environment";

export const domainURL = environment.hostname;
export const API_PREFIX = domainURL + '/v1/api/';
export const API_PREFIX_V2 = domainURL + '/api/v2/';

@Injectable()
export class HttpUtilsService {
  constructor() {
  }

  apiPrefix(path?: string, version?: string) {
    const prefix = version == 'v1' ? API_PREFIX : API_PREFIX_V2;
    return `${prefix}${path}`;
  }

  defaultOptions(): RequestOptions {
    const headers = new Headers({ 'Accept': 'application/json' });
    return new RequestOptions({ headers: headers });
  }

}

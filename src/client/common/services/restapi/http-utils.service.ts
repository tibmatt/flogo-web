import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
export const API_PREFIX = '/v1/api/';

@Injectable()
export class HttpUtilsService {
  constructor() {
  }

  apiPrefix(path?: string) {
    return `${API_PREFIX}${path}`;
  }

  defaultOptions(): RequestOptions {
    const headers = new Headers({ 'Accept': 'application/json' });
    return new RequestOptions({ headers: headers });
  }

}

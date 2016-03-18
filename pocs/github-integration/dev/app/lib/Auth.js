import {Injectable} from 'angular2/core';
import 'rxjs/Rx';
import {Http, Response} from 'angular2/http';

import {API_PATH} from './constants';

@Injectable()
export class Auth {

  static get parameters() {
    return [[Http]];
  }

  constructor (http) {
    this._http = http;
  }

  getGithubToken() {
    return this._http
      .get(API_PATH + 'githubtoken')
      .map(res => res.json().token)
    .share();
  }

}

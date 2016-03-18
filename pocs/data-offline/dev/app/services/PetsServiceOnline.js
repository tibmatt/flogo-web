import {Injectable} from 'angular2/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {Http, Response} from 'angular2/http';
import {v1 as getNewId} from '../lib/uuid';

const API_PATH = 'http://localhost:3000/';

@Injectable()
export class PetsServiceOnline {
  static get parameters() {
    return [[Http]];
  }

  constructor(http) {
    this._http = http;
  }

  getAll() {
    return this._http
      .get(API_PATH + 'pets')
      .map(res =>  res.json() )
      .share();
  }

  add(pet) {
    let subject = new ReplaySubject(1);
    let newPet = JSON.stringify(pet);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // TODO make it generic
    this._http
      .post(API_PATH + 'pet', newPet, {headers: headers})
      .subscribe(res => {
        subject.next({
          data: JSON.parse(res._body),
          isRemoteOperation: true
        });
      });

    return subject;
  }

}

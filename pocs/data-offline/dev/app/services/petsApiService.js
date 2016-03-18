import {Injectable} from 'angular2/core';
import 'rxjs/Rx';
import {Http, Response} from 'angular2/http';

const API_PATH = 'http://localhost:3000/';

@Injectable()
export class PetsApiService {

  static get parameters() {
    return [[Http]];
  }

  constructor (http) {
    this._http = http;
  }

  getPets() {
    return this._http
      .get(API_PATH + 'pets')
      .map(res => res.json())
      .share();
  }

  addPet(pet) {
    let newPet = JSON.stringify(pet);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');


    return this._http
      .post(API_PATH + 'pet', newPet, {headers: headers});

      //.map(res => res.json())
      //.share();

  }

}

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RESTAPISamplesService {
  constructor(public _http : Http ) {
  }

  getSample(url:string) {
    return this._http.get(url)
     .toPromise()
     .then( rsp => {
       if ( rsp.text() ) {
         return rsp.json();
       } else {
         return rsp;
       }
     } );
  }


}

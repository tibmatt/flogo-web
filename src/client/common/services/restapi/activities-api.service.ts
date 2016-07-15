import { Injectable } from '@angular/core';
import { FlogoDBService } from '../db.service';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class RESTAPIActivitiesService {
  constructor( private _db : FlogoDBService, private _http : Http ) {
  }

  getActivities() {
    return this._db.getAllActivities();
  }

  getInstallableActivities() {
    return this._db.getInstallableActivities();
  }

  installActivities( urls : string[] ) {

    let body = JSON.stringify( {
      'urls' : urls
    } );

    let headers = new Headers( {
      'Content-Type' : 'application/json',
      'Accept' : 'application/json'
    } );

    let options = new RequestOptions( { headers : headers } );

    return this._http.post( `/v1/api/activities`, body, options )
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

import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {HttpUtilsService} from "../http-utils.service";
import { Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RESTAPIContributionsService {
  pathToService:string ="contributions/devices";
  constructor(private _http: Http, private httpUtils: HttpUtilsService) {}

  getContributionDetails(ref: string){
    return this._http.get(this.httpUtils.apiPrefix(this.pathToService+'?filter[ref]=' + ref)).toPromise()
      .then(response => response.json().data[0]);
  }

  listContribs(type){
    return this._http.get(this.httpUtils.apiPrefix(this.pathToService+'?filter[type]=' + type)).toPromise();
  }

  installContributions( urls : string[] ) {
    let body = JSON.stringify( {
      'urls' : urls
    } );

    let headers = new Headers( {
      'Content-Type' : 'application/json',
      'Accept' : 'application/json'
    } );

    let options = new RequestOptions( { headers : headers } );

    return this._http.post(this.httpUtils.apiPrefix(this.pathToService), body, options ).map(res => res.json()).toPromise();

  }
}

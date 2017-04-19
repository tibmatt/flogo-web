import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { HttpUtilsService } from './http-utils.service';

@Injectable()
export class RESTAPIConfigurationService {

    constructor(private http:Http,private httpUtils: HttpUtilsService) {
      console.log("domainURL from environment");
      //console.log(domainURL);

    }

    getConfiguration() {
        return this.http.get(this.apiPrefix('configuration'))
                    .toPromise();

    }

    setConfiguration(configuration:any) {
        let headers = new Headers({'Content-Type':'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({ configuration:configuration });

        return this.http.post(this.apiPrefix('configuration'),body,options)
                        .toPromise();
    }


    resetConfiguration() {
        return this.http.get(this.apiPrefix('configuration/reset'))
            .toPromise();
    }
  private apiPrefix(path) {
    return this.httpUtils.apiPrefix(path, 'v1');
  }
}

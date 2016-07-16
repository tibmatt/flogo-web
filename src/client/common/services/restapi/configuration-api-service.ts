import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RESTAPIConfigurationService {
    constructor(private http:Http) {
    }

    getConfiguration() {
        return this.http.get('/v1/api/configuration')
                    .toPromise();
    }

    setConfiguration(configuration:any) {
        let headers = new Headers({'Content-Type':'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({ configuration:configuration });

        return this.http.post('/v1/api/configuration',body,options)
                        .toPromise();
    }
}
